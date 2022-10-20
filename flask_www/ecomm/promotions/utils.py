from flask_login import current_user
from flask import abort, request

from flask_www.accounts.utils import login_required
from flask_www.configs import db
from flask_www.ecomm.promotions.models import Coupon, PointLog, Point

coupon_obj = ''
new_point_log_obj = ''


@login_required
def coupon_code_check(req_code):
    existing_coupon = Coupon.query.filter_by(code=req_code).first()
    if existing_coupon:
        code_check_response = {
            "flash_message": "동일한 쿠폰코드가 존재합니다.",
        }
    else:
        code_check_response = {
            "flash_message": "사용가능한 쿠폰코드입니다.",
        }
    return code_check_response


@login_required
def coupon_save(coupon, req_code, use_from, use_to, amount, is_active, available_count):
    coupon.code = req_code
    coupon.use_from = use_from
    coupon.use_to = use_to
    coupon.amount = amount
    if is_active is not None:
        coupon.is_active = True
    else:
        coupon.is_active = False
    coupon.available_count = available_count

    db.session.add(coupon)
    db.session.commit()


@login_required
def coupon_count_update(used_coupons):
    global coupon_obj
    for used_coupon in used_coupons:
        coupon_obj = Coupon.query.get_or_404(used_coupon.coupon_id)
        coupon_obj.used_count += 1
        coupon_obj.available_count -= 1
    db.session.bulk_save_objects([coupon_obj])
    db.session.commit()


@login_required
def new_point_log_create(cart, point_obj):
    new_point_log = PointLog(user_id=current_user.id)
    new_point_log.point_id = point_obj.id,

    new_point_log.cart_id = cart.id,
    new_point_log.prep_point = cart.prep_point(),
    new_point_log.new_remained_point = (cart.remained_point() + cart.prep_point())
    db.session.add(new_point_log)
    db.session.commit()

    cart.point_log_id = new_point_log.id
    current_db_sessions = db.session.object_session(cart)
    current_db_sessions.add(cart)
    db.session.commit()
    return new_point_log


newpoint_log = ""


@login_required
def cart_point_log_create(cart, point_obj):
    """add_to_cart 하면, cart_view 로 넘어갈때 Point 객체와 PointLog 개체를 만드는 과정 """
    global newpoint_log
    point_log_obj = PointLog.query.filter_by(cart_id=cart.id).first()
    if not point_obj and not point_log_obj:
        print("if not point_obj and not point_log_obj:")
        new_point_obj = Point(user_id=current_user.id)
        db.session.add(new_point_obj)
        db.session.commit()

        newpoint_log = new_point_log_create(cart, new_point_obj)

    elif point_obj and not point_log_obj:
        print("elif point_obj and not point_log_obj:")
        newpoint_log = new_point_log_create(cart, point_obj)
    return newpoint_log


@login_required
def cart_point_log_update(cart, point_obj):
    """add_to_cart 하면, cart_view 로 넘어갈때 PointLog 업데이트하는 과정 또한,
    이미 담긴 cart product 의 변화가 생기면, cart.prep_point()에 변화가 생기므로, PointLog 업데이트도 해야한다."""
    point_log_obj = PointLog.query.filter_by(cart_id=cart.id).first()
    if point_obj and point_log_obj:
        print("if point_obj and point_log_obj:")
        print("point_log_obj.used_point", point_log_obj.used_point)
        print("not point_log_obj.used_point", not point_log_obj.used_point)
        print("-----------------------------------------------")
        point_log_obj.prep_point = cart.prep_point()
        point_log_obj.new_remained_point = (point_obj.remained_point + cart.prep_point() - int(point_log_obj.used_point))
        """ 굳이 분기를 하지 않아도 된다.
        if not point_log_obj.used_point:
            print("if not point_log_obj.used_point:")
            point_log_obj.new_remained_point = (point_obj.remained_point + cart.prep_point())
        else:
            print("if not point_log_obj.used_point: ===  else:")
            point_log_obj.new_remained_point = (point_obj.remained_point + cart.prep_point() - int(point_log_obj.used_point))
        """
        current_db_sessions = db.session.object_session(point_log_obj)
        current_db_sessions.add(point_log_obj)
        db.session.commit()
    else:
        abort(404)
    return point_log_obj


@login_required
def point_log_update(cart, point_obj, point_log, used_point, new_prep_point):
    """포인트 apply 과정에서, PointLog 객체를 수정하는 과정 그러나,
    이미 담긴 cart product 의 변화가 생기지 않으므로 cart.prep_point()에 변화가 생기지 않는다."""
    point_log.used_point = used_point
    point_log.prep_point = new_prep_point
    point_log.new_remained_point = point_obj.remained_point - int(point_log.used_point) + int(new_prep_point)
    point_log.user_id = current_user.id
    point_log.cart_id = cart.id
    current_db_sessions = db.session.object_session(point_log)
    current_db_sessions.add(point_log)
    db.session.commit()

    cart.point_log_id = point_log.id
    current_db_sessions = db.session.object_session(cart)
    current_db_sessions.add(cart)
    db.session.commit()


@login_required
def order_point_update(cart, point_obj):
    """결제하면 order_imp_transaction 에서 적용된다."""
    exist_total_accum_point = point_obj.total_accum_point #old
    exist_remained_point = point_obj.remained_point #old
    point_log_obj = PointLog.query.get(cart.point_log_id)
    if cart.point_log_id and point_log_obj:
        print('if cart.point_log_id')
        point_obj.total_accum_point += point_log_obj.prep_point
        point_obj.remained_point = point_log_obj.new_remained_point
        current_db_sessions = db.session.object_session(point_log_obj)
        current_db_sessions.add(point_log_obj)
        db.session.commit()
        # old_total_accum_point = point_obj.total_accum_point
        # Point.query.update(total_accum_point=old_total_accum_point + point_log_obj.prep_point,
        #                    remained_point=point_log_obj.remained_point
        #                    )

    if not cart.point_log_id:
        '''이런 경우는 존재하지 않겠네... 로직상 이 지점에 도달하지도 않겠네...
        카트에 담는 순간에 (add_to_cart_ajax)
        point_log 객체와 cart 에 그에 따른 point_log_id를 생성해버리니까...'''
        print('if not cart.point_log_id')
        point_log_obj = PointLog.query.filter_by(point_id=point_obj.id, cart_id=cart.id).first()  # add_to_cart_ajax때 이미 생성해왔다.
        try:
            ot_ap = int(exist_total_accum_point)
        except TypeError:
            ot_ap = 0  # point가 아예 없는 초출인 경우 old_total_accum_point은 None--->0으로 바꾸는 과정
        try:
            o_rp = int(exist_remained_point)
        except TypeError:
            o_rp = 0  # point가 아예 없는 초출인 경우 old_remained_point은 None--->0으로 바꾸는 과정
        point_obj.total_accum_point = ot_ap + point_log_obj.prep_point
        point_obj.remained_point = o_rp + point_log_obj.prep_point
        db.session.add(point_obj)
        db.session.commit()

        point_log_obj.remained_point = point_obj.remained_point  ## 최종 적립후 로그기록  거꾸로 보완 추가저장
        db.session.add(point_log_obj)
        db.session.commit()