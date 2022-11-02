from flask import Blueprint, render_template
from flask_login import current_user
from sqlalchemy import desc

from flask_www.accounts.utils import login_required
from flask_www.ecomm.carts.models import Cart
from flask_www.ecomm.orders.models import Order, OrderProductOption, OrderCoupon, OrderTransaction
from flask_www.ecomm.promotions.models import PointLog

NAME = 'tests'
tests_bp = Blueprint(NAME, __name__, url_prefix='/tests')


@tests_bp.route('/complete/list', methods=['GET'])
@login_required
def order_complete_list():
    orders = Order.query.filter_by(buyer_id=current_user.id, is_paid=True).order_by(desc(Order.created_at)).all()
    carts = Cart.query.filter_by(user_id=current_user.id).all()
    order_optionitems = OrderProductOption.query.filter_by(buyer_id=current_user.id).all()
    point_logs = PointLog.query.filter_by(user_id=current_user.id).all()
    order_coupons = OrderCoupon.query.filter_by(consumer_id=current_user.id, is_paid=True).all()
    trans_all = OrderTransaction.query.filter_by(buyer_id=current_user.id).all()
    all_orders_with_transaction_fail = Order.query.filter_by(buyer_id=current_user.id).order_by(desc(Order.created_at)).all()

    return render_template('tests/order_complete_list.html',
                           orders=orders,
                           # carts=carts, # order.cart.get_total_delivery_pay() 를 사용
                           order_optionitems=order_optionitems,
                           point_logs=point_logs,
                           order_coupons=order_coupons,
                           # trans_all=trans_all, # order.order_ordertransaction_set 을 사용하면 된다.
                           # all_orders=all_orders_with_transaction_fail  # 임시로 볼려고 해놨다.
                           )