from decimal import Decimal

from flask_www.commons.models import BaseModel, VarRatio, BaseAmount
from flask_www.configs import db
from flask_www.ecomm.products.models import Product, ProductOption
from flask_www.ecomm.promotions.models import UsedCoupon, Point, PointLog


class Cart(BaseModel):
    __tablename__ = 'carts'
    cart_id = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('cart_user_set'))
    cart_total_price = db.Column(db.Integer)
    point_log_id = db.Column(db.Integer)
    point_log = db.relationship('PointLog', backref=db.backref('cart_point_log_set'),
                                primaryjoin='foreign(Cart.point_log_id) == remote(PointLog.id)')

    is_active = db.Column('Active', db.Boolean(), nullable=False, default=True)

    def __repr__(self):
        return f"<Cart(ID: '{self.id}', cart_id: {self.cart_id})>"

    def subtotal_price(self):
        return self.cart_total_price

    def coupon_discount_total(self):
        used_coupons = UsedCoupon.query.filter_by(cart_id=self.id, consumer_id=self.user_id).all()
        total = 0
        if used_coupons:
            for used_coupon in used_coupons:
                total += used_coupon.amount
        return total

    def prep_point(self):  # 적립포인트 비율:결제금액의 1.8%...from common.models import VarRatio
        point_ratio = VarRatio.query.get(2).ratio
        return round(float(self.get_total_price()) * float(point_ratio))  # float(0.018))

    def remained_point(self):
        point_obj = Point.query.filter_by(user_id=self.user_id).first()
        if not point_obj:
            return 0
        else:
            return point_obj.remained_point

    def used_point(self):
        point_log = PointLog.query.filter_by(id=self.point_log_id).first()
        if point_log:
            return point_log.used_point
        else:
            return 0

    def new_remained_point(self):
        return self.remained_point() - self.used_point() + self.prep_point()

    def discount_total_amount(self):
        point_log = PointLog.query.filter_by(id=self.point_log_id).first()
        base_pay_amount = BaseAmount.query.get_or_404(1).amount
        if point_log:
            if self.coupon_discount_total() > 0:  # 추가
                discount_total = self.coupon_discount_total() + int(point_log.used_point)
                if self.subtotal_price() >= discount_total + base_pay_amount:
                    return discount_total
            else:
                if self.subtotal_price() >= int(point_log.used_point) + base_pay_amount:
                    return int(point_log.used_point)
        else:  # 이런 경우는 없겠네.... add_to_cart_ajax 하고, cart_view 할때 PointLog 를 만든다.
            if self.coupon_discount_total() > 0:
                if self.subtotal_price() >= self.coupon_discount_total() + base_pay_amount:
                    return self.coupon_discount_total()
        return Decimal(0)

    def get_total_delivery_pay(self):
        cart_products = CartProduct.query.filter_by(cart_id=self.id).all()
        existing_total = 0
        for cp in cart_products:
            existing_total += cp.product.delivery_pay
        return existing_total

    def get_total_price(self):
        return self.subtotal_price() - self.discount_total_amount()

    def get_real_pay_price(self):
        return self.get_total_price() + self.get_total_delivery_pay()

    def sell_charge_amount(self):  # 판매 수수료: 결제금액의 7.7%...from common.models import VarRatio
        try:
            sell_charge_ratio = VarRatio.query.get_or_404(1).ratio
            # sell_charge_ratio = VarRatio.query.filter_by(id=1).first().ratio
        except Exception as e:
            print("sell_charge_amount exception error", e)
            sell_charge_ratio = 0
        return round(float(self.get_total_price()) * float(sell_charge_ratio))


class CartProduct(BaseModel):
    __tablename__ = 'cart_products'
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id', ondelete='CASCADE'), nullable=False)
    cart = db.relationship('Cart', backref=db.backref('cartproduct_cart_set'))

    product_id = db.Column(db.Integer)
    product = db.relationship('Product', backref=db.backref('cartproduct_product_set'),
                              primaryjoin='foreign(CartProduct.product_id) == remote(Product.id)')

    shopcategory_id = db.Column(db.Integer)
    shopcategory = db.relationship('ShopCategory', backref=db.backref('shop_cartproduct_set'),
                                   primaryjoin='foreign(CartProduct.shopcategory_id) == remote(ShopCategory.id)')

    title = db.Column(db.String(100))  # 이거를 넣어야 겠다.
    price = db.Column(db.Integer, default=0)
    applied_price = db.Column(db.Integer, default=0)
    base_dc_amount = db.Column(db.Integer, default=0)
    product_subtotal_quantity = db.Column(db.Integer, default=0)
    product_subtotal_price = db.Column(db.Integer, default=0)
    op_subtotal_price = db.Column(db.Integer, default=0)
    line_price = db.Column(db.Integer, default=0)

    is_active = db.Column('Active', db.Boolean(), nullable=False, default=True)

    def __repr__(self):
        return f"<CartProduct('iD: {self.id}, {Product.query.filter_by(id=self.product_id).one()}')>"

    @classmethod
    def get_product(cls):
        return Product.query.filter_by(id=cls.product_id).first()

    @classmethod
    def get_cart_optionitems(cls):
        return CartProductOption.query.filter_by(cart_product_id=cls.product_id).all()


class CartProductOption(BaseModel):
    __tablename__ = 'cart_productoptions'
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id', ondelete='CASCADE'), nullable=False)

    product_id = db.Column(db.Integer)
    """
    카트에서 옵션삭제할 때 아래 에러 발생
    SAWarning: Multiple rows returned with uselist=False for lazily-loaded attribute 'CartProductOption.cart_product'
    카트에 add_to_cart 할 때 아래 에러 발생
    sawarning: multiple rows returned with uselist=false for eagerly-loaded attribute 'CartProductOption.cart_product'
    결국 db.relationship 적용하지 않고, product_id만 저장함
    """
    cart_product = db.relationship('CartProduct', backref=db.backref('cartproduct_cartproductoption_set', cascade='all, delete-orphan'),
                                   primaryjoin='foreign(CartProductOption.product_id) == remote(CartProduct.product_id)', lazy="joined")  #

    option_id = db.Column(db.Integer)
    option = db.relationship('ProductOption', backref=db.backref('productoption_cartproductoption_set'),
                             primaryjoin='foreign(CartProductOption.option_id) == remote(ProductOption.id)')

    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, default=0)
    op_quantity = db.Column(db.Integer, default=0)
    op_line_price = db.Column(db.Integer, default=0)

    is_active = db.Column('Active', db.Boolean(), nullable=False, default=True)

    def __repr__(self):
        return f"<CartOptionItem('cart_id: {self.cart_id}', product_id: {self.product_id}, option_id: {self.option_id})>"

    @classmethod
    def get_option(cls):
        return ProductOption.query.filter_by(id=cls.option_id).first()

