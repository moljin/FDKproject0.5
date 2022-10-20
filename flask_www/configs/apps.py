from datetime import datetime

from flask import render_template, g
from flask_login import current_user
from pytz import timezone

from flask_www.configs.config import NOW


def related_app(app):
    from flask_www.configs import db

    """ === Request hook === """
    @app.errorhandler(404)
    def page_404(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(401)
    def page_401(error):
        return render_template('errors/401.html'), 401

    @app.errorhandler(500)
    def internal_server_error(e):
        # note that we set the 500 status explicitly
        return render_template('errors/500.html'), 500

    """ === Request-related function === """
    @app.before_request
    def before_request():
        g.db = db.session
        g.user = current_user  # 추가: g.db and g.user 를 사용하기 위해???
        app.logger.info('BEFORE_REQUEST')

    @app.teardown_request
    def teardown_request(exception):
        app.logger.info('TEARDOWN_REQUEST')
        if hasattr(g, 'db'):
            g.db.close()

    @app.teardown_appcontext
    def teardown_appcontext(exception=None):
        app.logger.info('TEARDOWN_CONTEXT')
        db.session.remove()

    '''추가:: === Request hook, Context controll 쓸만 한거들... === '''
    @app.before_first_request
    def before_first_request():
        app.logger.info('BEFORE_FIRST_REQUEST')

    @app.after_request
    def after_request(response):
        app.logger.info("AFTER_REQUEST")
        return response

    @app.template_filter('daytime')
    def _format_datetime(value, _type=None):  # 템플릿단 얘시: what_date|daytime("full")
        if _type == "full":
            _format = '%Y-%m-%d %H:%M:%S %p'
        elif _type == "medium":
            _format = '%Y-%m-%d %H:%M %p'
        elif _type == "small":
            _format = '%Y-%m-%d'
        else:
            _format = '%y.%m.%d'
        return value.strftime(_format)

    @app.context_processor
    def inject_profile():
        from flask_www.accounts.models import Profile
        try:
            if current_user.is_authenticated:
                profile_obj = db.session.query(Profile).filter_by(user_id=current_user.id).first()
                return dict(current_profile=profile_obj)
            else:
                return dict(current_user=g.user)
        except Exception as e:
            print(e)

    @app.context_processor
    def inject_now():
        now_time = datetime.now(timezone('Asia/Seoul')).today()
        return dict(now=now_time)

    # @app.context_processor
    # def inject_real_active_current_cart():
    #     from flask_www.ecomm.carts.models import Cart
    #     try:
    #         if current_user.is_authenticated:
    #             if current_user.cart_user_set:
    #                 cart = Cart.query.filter_by(user_id=current_user.id, is_active=True).first()
    #                 if cart:
    #                     diff_time = NOW - cart.updated_at
    #                     beyond_days = diff_time.days
    #                     if cart and (beyond_days < 1):
    #                     # if cart and (beyond_days < 1) and (cart.cart_total_price > 0):
    #                         return dict(current_cart=cart)
    #                     else:
    #                         return dict(current_cart=None)  # 카트가 없거나. 카트생성후 1개월이 지났거나, 카트에 상품이 없는 경우
    #             else:
    #                 return dict(current_cart=None)
    #         else:
    #             return dict(current_cart=None)
    #     except Exception as e:
    #         print(e)

    @app.context_processor
    def cart_items_total_count():
        from flask_www.ecomm.carts.models import Cart
        from flask_www.ecomm.carts.models import CartProduct
        try:
            if current_user.is_authenticated:
                if current_user.cart_user_set:
                    cart = Cart.query.filter_by(user_id=current_user.id, is_active=True).first()
                    if cart:
                        diff_time = NOW - cart.updated_at
                        beyond_days = diff_time.days
                        if beyond_days < 31:
                            cart_products = CartProduct.query.filter_by(cart_id=cart.id).all()
                            return dict(cart_items_total_count=len(cart_products), current_cart=cart)
                        else:  # 카트가 있어도, 1개월이 지나면...
                            return dict(current_cart=None)
                    else:  # 카트가 없는 경우
                        return dict(current_cart=None)
                else:
                    return dict(current_cart=None)
            else:
                return dict(current_cart=None)
        except Exception as e:
            print(e)
        pass

    @app.template_filter('class_name')
    def model_class_name(value):
        return value.__class__.__name__

    @app.template_filter('timesince')
    def time_since(created_at, default="지금 바로"):
        now_time = datetime.now(timezone('Asia/Seoul')).today()
        diff = now_time - created_at
        diff_sec = diff.seconds
        diff_hour = int((diff.seconds / 60 / 60))
        diff_day = diff.days

        year = int((diff.days / 365))
        remained_month = int(int((diff.days % 365)) / 30)
        month = int(diff.days / 30)
        remained_day = int(diff.days % 30)
        hour = int(diff.seconds / 60 / 60)
        minute = int(diff.seconds / 60)
        remained_min = int(diff.seconds / 60 - (int(diff.seconds / 60 / 60)) * 60)

        if diff_day >= 365:
            if remained_month == 0:
                return f'{year}년전'
            else:
                return f'{year}년 {remained_month}개월전'
        if 365 > diff_day >= 32:
            if remained_day == 0:
                return f'{month}개월전'
            else:
                return f'{month}개월 {remained_day}일전'
        if 31 > diff_day >= 1:
            return f'{diff.days}일 {hour}시간전'
        if (1 > diff_day) and (24 > diff_hour >= 1):
            if remained_min == 0:
                return f'{hour}시간전'
            else:
                return f'{hour}시간 {remained_min}분전'
        if 3600 > diff.seconds:
            return f'{minute}분전'
        #  https://github.com/fengsp/flask-snippets/blob/master/templatetricks/timesince_filter.py
        return default

    @app.template_filter('intcomma')  # 최고 간단방법, 위(flask-babel 을 이용한 방법)와 같다. https://cosmosproject.tistory.com/373
    def num_intcomma(value):
        # return '{:,}'.format(value)
        intcomma = f"{value:,}"
        return intcomma
