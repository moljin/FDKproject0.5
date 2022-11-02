from flask import Blueprint, render_template
from flask_login import current_user
from sqlalchemy import desc

from flask_www.commons.utils import elapsed_day
from flask_www.ecomm.carts.models import Cart
from flask_www.ecomm.orders.models import Order
from flask_www.ecomm.products.models import ShopCategory, Product

NAME = 'commons'
common_bp = Blueprint(NAME, __name__)


@common_bp.route('/')
def index():
    shopcategories = ShopCategory.query.order_by(desc(ShopCategory.created_at))
    products = Product.query.order_by(desc(Product.created_at))
    return render_template('index.html', products=products, shopcategories=shopcategories)


@common_bp.route('/extra/related/dev')
def extra_dev():
    if current_user.is_authenticated:
        cart = Cart.query.filter_by(user_id=current_user.id, is_active=True).first()
        orders = Order.query.filter_by(buyer_id=current_user.id).all()
        if cart:
            return render_template('extra_page/related_dev.html', cart=cart, orders=orders)
        else:
            return render_template('extra_page/related_dev.html', orders=orders)
    else:
        return render_template('extra_page/related_dev.html')


@common_bp.route('/server/dev')
def server():
    return render_template('extra_page/server.html')