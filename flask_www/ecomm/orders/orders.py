import requests
from flask import Blueprint, request, g, make_response, jsonify, render_template, flash, redirect, abort
from flask_login import current_user
from sqlalchemy import desc

from flask_www.accounts.utils import login_required
from flask_www.configs import db
from flask_www.configs.config import NOW
from flask_www.ecomm.carts.models import Cart, CartProduct, CartProductOption
from flask_www.ecomm.orders.forms import OrderCreateForm
from flask_www.ecomm.orders.iamport import req_cancel_pay, req_billing_key, onetime_pay_billing_key, onetime_pay_without_key, find_transaction, get_token
from flask_www.ecomm.orders.models import Order, OrderCoupon, OrderProduct, OrderProductOption, OrderTransaction, ORDER_STATUS, PAY_TYPE, CancelPayOrder, CustomerUid
from flask_www.ecomm.orders.utils import order_transaction_create, product_stock_update, product_option_stock_update, iamport_client_validation, check_customer_uid, get_transaction
from flask_www.ecomm.promotions.models import PointLog, UsedCoupon, Point
from flask_www.ecomm.promotions.utils import coupon_count_update, order_point_update

NAME = 'orders'
orders_bp = Blueprint(NAME, __name__, url_prefix='/orders')


@orders_bp.route('/create/ajax', methods=['POST'])
@login_required
def order_create_ajax():
    cart = Cart.query.filter_by(id=request.form.get("ordercart_id")).first()
    try:
        user_id = current_user.id
    except:
        user_id = None
    cart_productitems = CartProduct.query.filter_by(cart_id=cart.id).all()
    cart_optionitems = CartProductOption.query.filter_by(cart_id=cart.id).all()
    form = OrderCreateForm()
    if request.method == "POST" and form.validate_on_submit():
        try:
            point_log = PointLog.query.filter_by(cart_id=cart.id).first()
        except Exception as e:
            print(e, 'no used_point')
            point_log = None
        new_order = Order(
            order_num=NOW.strftime('%Y%m%d%H%M%S%f'),
            user_id=user_id,
            cart_id=cart.id,
            name=request.form.get('name'),
            email=request.form.get('email'),
            phonenumber=request.form.get('phonenumber'),
            postal_code=request.form.get('postal_code'),
            address=request.form.get('address'),
            detail_address=request.form.get('detail_address'),
            extra_address=request.form.get('extra_address'),
            order_memo=request.form.get('order_memo'),
            used_point=point_log.used_point,
            get_point=cart.prep_point(),
            total_discount_amount=cart.discount_total_amount(),
            total_order_amount=cart.subtotal_price(),
            get_total_amount=cart.get_total_price(),
            total_delivery_pay_amount=cart.get_total_delivery_pay(),
            real_paid_amount=cart.get_real_pay_price()
        )
        g.db.add(new_order)
        g.db.commit()
        used_coupons = UsedCoupon.query.filter_by(cart_id=cart.id, consumer_id=current_user.id).all()
        if used_coupons:
            for used_coupon in used_coupons:
                new_order_coupon = OrderCoupon(
                    order_id=new_order.id,
                    coupon_id=used_coupon.coupon_id,
                    code=used_coupon.code,
                    amount=used_coupon.amount,
                    owner_id=used_coupon.owner_id,
                    consumer_id=used_coupon.consumer_id
                )
                g.db.bulk_save_objects([new_order_coupon])
            g.db.commit()
        for cart_productitem in cart_productitems:
            new_order_productitem = OrderProduct(
                order_id=new_order.id,
                product_id=cart_productitem.product_id,
                pd_price=cart_productitem.price,
                pd_subtotal_price=cart_productitem.product_subtotal_price,
                pd_subtotal_quantity=cart_productitem.product_subtotal_quantity,
                op_subtotal_price=cart_productitem.op_subtotal_price,
                line_price=cart_productitem.line_price
            )
            g.db.bulk_save_objects([new_order_productitem])
        g.db.commit()
        if cart_optionitems:
            for cart_optionitem in cart_optionitems:
                new_order_optionitem = OrderProductOption(
                    order_id=new_order.id,
                    orderproduct_product_id=cart_optionitem.product_id,
                    option_id=cart_optionitem.option_id,
                    op_title=cart_optionitem.title,
                    op_price=cart_optionitem.price,
                    op_quantity=cart_optionitem.op_quantity,
                    op_line_price=cart_optionitem.op_line_price
                )
                g.db.bulk_save_objects([new_order_optionitem])
            g.db.commit()
            pass
        data = {'order_id': new_order.id}
        return make_response(jsonify(data), 200)
    else:
        message = '어딘가 올바르지 않게 입력되었어요!!'
        return make_response(jsonify({'message': message}), 401)


@orders_bp.route('/checkout/ajax', methods=['POST'])
@login_required
def order_checkout_ajax():
    order_id = request.form['order_id']
    order = Order.query.filter_by(id=order_id).first()
    paid_amount = request.form['amount']

    try:
        print('저기1 order_id', order_id)
        merchant_order_id = order_transaction_create(order_id=order_id, amount=paid_amount)
        print("저기2: merchant_order_id: ", merchant_order_id)
    except Exception as e:
        print(e)
        merchant_order_id = None

    if merchant_order_id is not None:
        data = { # checkout.js: OrderCheckoutAjax 로 넘기는 data
            "works": True,
            "_message": "order_checkout_ajax: success",
            "merchant_id": merchant_order_id# + '@' + str(uuid.uuid4()) + NOW.microsecond#
        }
        print("0000000000000000000 여기3 data", data)  # 결제하기를 누르면 여기까지(결제창이 뜸) 진행된다.
        return make_response(jsonify(data), 200)
    else:
        message = 'order_checkout_ajax: 401 Error'
        return make_response(jsonify({'_message': message}), 401)


@orders_bp.route('/imp/ajax', methods=['POST'])
@login_required
def order_imp_transaction():
    cart = Cart.query.filter_by(id=request.form.get("cart_id")).first()
    order_id = request.form['order_id']
    order = Order.query.filter_by(id=order_id).first()

    order_productitems = OrderProduct.query.filter_by(order_id=order_id).all()
    order_optionitems = OrderProductOption.query.filter_by(order_id=order_id).all()
    if order_productitems and not order_optionitems:
        product_stock_update(order_productitems)
    if order_productitems and order_optionitems:
        product_option_stock_update(order_productitems, order_optionitems)

    used_coupons = UsedCoupon.query.filter_by(cart_id=cart.id, consumer_id=current_user.id).all()
    if used_coupons:
        coupon_count_update(used_coupons)

    point_obj = Point.query.filter_by(user_id=current_user.id).first() # 카트에 담을때 이미 포인트객체를 만들어 놓는다.
    if point_obj:
        order_point_update(cart, point_obj)

    # # 구매 메일링 여기에 넣으면 될 듯...

    # origin_merchant_id = request.POST.get('merchant_id').split("@")[0]
    merchant_id = request.form['merchant_id']
    imp_id = request.form['imp_id']
    amount = request.form['amount']
    print('class OrderImpAjaxView;;;order', order)
    print("class OrderImpAjaxView;;;merchant_id", merchant_id)
    print("class OrderImpAjaxView;;;imp_id", imp_id)
    print('class OrderImpAjaxView;;;amount', amount)

    try:
        trans = OrderTransaction.query.filter_by(
            order_id=order_id,
            merchant_order_id=merchant_id,
            amount=amount
        ).first()
    except:
        trans = None

    if trans is not None:
        trans.transaction_id = imp_id
        trans.is_success = True
        trans.transaction_status = "OK"
        trans.type = PAY_TYPE[0]  # 가상계좌, 계좌이체 사용시 받아서 저장
        current_db_sessions = db.session.object_session(trans)
        current_db_sessions.add(trans)

        order.is_paid = True
        order.order_status = ORDER_STATUS[1]
        current_db_sessions = db.session.object_session(order)
        current_db_sessions.add(order)
        db.session.commit()
        print('00000000000 ;;iamport_client_;; order_payment_validation 이 위치에서 실행된다.')
        iamport_client_validation(merchant_id, order_id)

        data = {
            "works": True,
            "order_id": order_id
        }

        print("여기3333")
        print('OrderImpAjaxView :::data', data)
        # cart.delete()
        cart.is_active = False
        cart.cart_id = '주문완료된 카트'
        current_db_sessions = db.session.object_session(cart)
        current_db_sessions.add(cart)
        db.session.commit()

        return make_response(jsonify(data), 200)
    else:
        return make_response(jsonify({}), 401)


@orders_bp.route('/pay/complete/mobile', methods=['GET'])
@login_required
def pay_complete_mobile():
    imp_uid = request.args.get("imp_uid")
    merchant_uid = request.args.get("merchant_uid ")
    return render_template('ecomm/orders/mobile_complete.html',
                           imp_uid=imp_uid,
                           merchant_uid=merchant_uid,
                           request=request.args
                           )


@orders_bp.route('/complete/detail', methods=['GET'])
@login_required
def order_complete_detail():
    order_id = request.full_path.split('=')[1] #ajax reload url의 full_path에서 잘라냄
    order = Order.query.filter_by(id=order_id).first()
    order_productitems = OrderProduct.query.filter_by(order_id=order_id).all()
    order_optionitems = OrderProductOption.query.filter_by(order_id=order_id).all()
    order_coupons = OrderCoupon.query.filter_by(order_id=order_id).all()
    order_transaction = OrderTransaction.query.filter_by(order_id=order_id).first()
    cancel_pay = CancelPayOrder.query.filter_by(order_id=order_id, is_success=True).first()
    print(type(order))
    print("order_productitems", order_productitems)
    print("order_optionitems", order_optionitems)
    print("order_coupons", order_coupons)
    return render_template('ecomm/orders/order_complete_detail.html',
                           order=order,
                           order_productitems=order_productitems,
                           order_optionitems=order_optionitems,
                           order_coupons=order_coupons,
                           order_transaction=order_transaction,
                           cancel_pay=cancel_pay)


@orders_bp.route('/complete/list', methods=['GET'])
@login_required
def order_complete_list():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(desc(Order.created_at)).all()
    order_coupons = OrderCoupon.query.all()

    return render_template('ecomm/orders/order_complete_list.html', orders=orders)


@orders_bp.route('/cancel/pay/ajax', methods=['POST'])
@login_required
def cancel_pay_ajax():
    if request.method == "POST":
        merchant_uid = request.form.get("merchant_uid")
        req_cancel_amount = request.form.get("cancel_amount")
        cancel_reason = request.form.get("cancel_reason")
        pay_type = request.form.get("pay_type")
        """가상계좌의 경우 단방향 결제수단이여서 환불 대상을 알 수 없으므로, 
        환불 금액 외에 다음의 환불 수령계좌 정보를 입력해야 합니다."""
        refund_holder = request.form.get("refund_holder")
        refund_bank = request.form.get("refund_bank")
        refund_account = request.form.get("refund_account")
        order_trans = OrderTransaction.query.filter_by(merchant_order_id=merchant_uid).first()
        print(order_trans)
        if order_trans:
            cancelable_amount = order_trans.amount - order_trans.cancel_amount
            if cancelable_amount <= 0:
                data = {
                    "_success": "이미 전액 환불된 주문입니다."
                }
                return make_response(jsonify(data), 200)
            print("아임포트 REST API 로 결제환불 요청")
            imp_uid = order_trans.transaction_id
            cancel_response = req_cancel_pay(cancel_reason, imp_uid, req_cancel_amount, cancelable_amount)
            print("req_cancel_response", cancel_response)

            buyer_id = current_user.id
            order_id = order_trans.order_id
            ordertransaction_id = order_trans.id
            merchant_uid = cancel_response['response']['merchant_uid']
            try:
                cancel_pay = CancelPayOrder.query.filter_by(
                    buyer_id=buyer_id,
                    order_id=order_id,
                    ordertransaction_id=ordertransaction_id,
                    merchant_uid=merchant_uid,
                ).first()
            except:
                cancel_pay = None

            # code = cancel_response['code']
            order_title = cancel_response['response']['name']
            buyer_name = cancel_response['response']['buyer_name']
            cancel_amount = cancel_response['response']['cancel_amount']
            cancel_reason = cancel_response['response']['cancel_reason']
            # imp_uid = cancel_response['response']['imp_uid']
            # pay_method = cancel_response['response']['pay_method']

            card_name = cancel_response['response']['card_name']
            card_number = cancel_response['response']['card_number']
            if cancel_pay is None:
                new_cancel_pay = CancelPayOrder(user_id=buyer_id,
                                                order_id=order_id,
                                                ordertransaction_id=ordertransaction_id,
                                                merchant_uid=merchant_uid,
                                                order_title=order_title,
                                                buyer_name=buyer_name,
                                                cancel_amount=cancel_amount,
                                                cancel_reason=cancel_reason,
                                                type=pay_type,
                                                card_name=card_name,
                                                card_number=card_number,
                                                is_success=True)
                db.session.add(new_cancel_pay)

                order_trans.is_cancel = True
                order_trans.cancel_amount = cancel_amount
                db.session.add(order_trans)
                db.session.commit()
            else:
                print("나중에 부분결제가 있는 경우 적용할 계획")
            data = {
                "_success": "success",
                "flash_message": "결제취소가 정상적으로 완료되었습니다."
            }
            return make_response(jsonify(data), 200)

        else:
            # flash("결제한 내용이 없습니다.")
            # return redirect(request.referrer)
            data = {
                "_success": "fail error"
            }
            return make_response(jsonify(data), 200)

    else:
        abort(401)


@orders_bp.route('billing/key/checkout/ajax', methods=['POST'])
@login_required
def billing_key_checkout_ajax():
    card_num1 = request.form.get('card_num1')
    card_num2 = request.form.get('card_num2')
    card_num3 = request.form.get('card_num3')
    card_num4 = request.form.get('card_num4')
    req_card_number = card_num1 + "-" + card_num2 + "-" + card_num3 + "-" + card_num4
    # card_number = card_num1 + card_num2 + card_num3 + card_num4
    expiry_num1 = request.form.get('expiry_num1')
    expiry_num2 = request.form.get('expiry_num2')
    expiry = "20" + expiry_num1 + "-" + expiry_num2
    # expiry = "20" + expiry_num1 + expiry_num2
    # print('"20" + expiry_num1 + "-" + expiry_num2', expiry)
    birth = request.form.get('birth')
    pwd_2digit = request.form.get('pwd_2digit')
    merchant_uid = request.form.get('merchant_uid')
    amount = request.form.get('amount')

    req_customer_uid = request.form.get('customer_uid')
    customer_uid_obj = CustomerUid.query.filter_by(user_id=current_user.id, customer_uid=req_customer_uid).first()
    print("customer_uid_obj", customer_uid_obj)
    customer_uid = check_customer_uid(req_card_number, expiry, req_customer_uid)
    print("customer_uid", customer_uid)

    # billing_key_response = req_billing_key(req_card_number, expiry, birth, pwd_2digit, customer_uid)
    billing_key_response = onetime_pay_billing_key(req_card_number, expiry, birth, pwd_2digit, customer_uid, merchant_uid, amount)
    # billing_key_response = onetime_pay_without_key(req_card_number, expiry, birth, merchant_uid, amount)
    print("billing_key_response::: ", billing_key_response)

    data = {
        "_success": "billing_key_checkout_ajax:: success",
        "billing_key_response": billing_key_response
    }
    return make_response(jsonify(data), 200)


"""
a = {'code': 0, 
    'message': None,
   'response': {'amount': 500, 'apply_num': '68767364', 'bank_code': None, 'bank_name': None, 'buyer_addr': None, 'buyer_email': 'moljin@naver.com', 'buyer_name': '양성훈', 'buyer_postcode': None,
                'buyer_tel': None, 'cancel_amount': 500, 
                'cancel_history': [{'pg_tid': 'StdpayISP_INIpayTest20221018174537673783', 'amount': 500, 'cancelled_at': 1666082753, 'reason': '테스트',
                                                                             'receipt_url': 'https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayISP_INIpayTest20221018174537673783&noMethod=1'}],
                'cancel_reason': '테스트', 'cancel_receipt_urls': ['https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayISP_INIpayTest20221018174537673783&noMethod=1'],
                'cancelled_at': 1666082753, 'card_code': '361', 'card_name': 'BC카드', 'card_number': '910020*********7', 'card_quota': 0, 'card_type': 0, 'cash_receipt_issued': False, 'channel': 'pc',
                'currency': 'KRW', 'custom_data': None, 'customer_uid': None, 'customer_uid_usage': None, 'emb_pg_provider': None, 'escrow': False, 'fail_reason': None, 'failed_at': 0,
                'imp_uid': 'imp_238673674012', 'merchant_uid': 'b28c2a7412357341fdc8', 'name': '홈오피스PC등', 'paid_at': 1666082737, 'pay_method': 'card', 'pg_id': 'INIpayTest',
                'pg_provider': 'html5_inicis', 'pg_tid': 'StdpayISP_INIpayTest20221018174537673783',
                'receipt_url': 'https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=StdpayISP_INIpayTest20221018174537673783&noMethod=1', 'started_at': 1666082673,
                'status': 'cancelled', 'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'vbank_code': None,
                'vbank_date': 0, 'vbank_holder': None, 'vbank_issued_at': 0, 'vbank_name': None, 'vbank_num': None}}
"""
