from flask_www.commons.models import BaseModel
from flask_www.configs import db

ORDER_STATUS = ('미결제',
                '결제확인중',
                '결제확인완료',
                '배송준비중',
                '배송중',
                '배송완료',
                '거래완료',
                '반송중',
                '주문취소중',
                '주문취소완료')


PAY_TYPE = ('카드결제',
            '가상계좌',
            '계좌이체')


class Order(BaseModel):
    __tablename__ = 'orders'
    order_num = db.Column(db.String(50))
    name = db.Column(db.String(250), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref=db.backref('user_order_set'))

    cart_id = db.Column(db.Integer)
    cart = db.relationship('Cart', backref=db.backref('order_cart_set'),
                           primaryjoin='foreign(Order.cart_id) == remote(Cart.id)')

    email = db.Column(db.String(120), nullable=False)
    phonenumber = db.Column(db.String(20), nullable=False)

    postal_code = db.Column(db.String(20), nullable=False)
    address = db.Column('주소', db.String(250), nullable=False)
    detail_address = db.Column('상세주소', db.String(250), nullable=False)
    extra_address = db.Column('주소 참고항목', db.String(250), nullable=True)

    order_memo = db.Column(db.String(250), nullable=True)

    is_paid = db.Column(db.Boolean(), nullable=False, default=False)
    order_status = db.Column(db.String(250), default=ORDER_STATUS[0])  # , choices=ORDER_STATUS) # Form에서  적용

    used_point = db.Column(db.Integer, default="")
    get_point = db.Column(db.Integer, default="")

    total_order_amount = db.Column(db.Integer, default="")
    total_discount_amount = db.Column(db.Integer, default="")
    get_total_amount = db.Column(db.Integer, default="")
    total_delivery_pay_amount = db.Column(db.Integer, default="")
    real_paid_amount = db.Column(db.Integer, default="")

    is_display = db.Column(db.Boolean(), nullable=False, default=True)
    """order 는 영원히 삭제 안되네..이용자가 삭제하더라도.false 로만 변경. 통계 보관..."""

    def order_coupon_total(self):
        order_coupons = OrderCoupon.query.filter_by(order_id=self.id, consumer_id=self.user_id).all()
        total = 0
        if order_coupons:
            for order_coupon in order_coupons:
                total += order_coupon.amount
        return total


class OrderCoupon(BaseModel):
    __tablename__ = 'order_coupons'
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id', ondelete='CASCADE'), nullable=True)
    order = db.relationship('Order', backref=db.backref('order_coupon_set'))

    consumer_id = db.Column(db.Integer, nullable=False)
    consumer = db.relationship('User', backref=db.backref('ordercoupon_consumer_set'),
                               primaryjoin='foreign(OrderCoupon.consumer_id) == remote(User.id)')

    coupon_id = db.Column(db.Integer, nullable=False)
    coupon = db.relationship('Coupon', backref=db.backref('ordercoupon_coupon_set'),
                             primaryjoin='foreign(OrderCoupon.coupon_id) == remote(Coupon.id)')

    code = db.Column(db.String(250))
    amount = db.Column(db.Integer, default="")
    is_paid = db.Column(db.Boolean(), nullable=False, default=False)
    """결제하기 버튼을 누르면 order_coupon 객체 를 만든다.
    그래서, 결제하기 클릭후 완료하지 않고 도중에 벗어났다가, 결제하기를 누른경우와 구분하기 위해"""

    owner_id = db.Column(db.Integer, nullable=False)
    owner = db.relationship('User', backref=db.backref('ordercoupon_owner_set'),
                            primaryjoin='foreign(OrderCoupon.owner_id) == remote(User.id)')


class OrderProduct(BaseModel):
    __tablename__ = 'order_products'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref=db.backref('user_orderproduct_set'))

    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    order = db.relationship('Order', backref=db.backref('order_orderproduct_set', cascade='all, delete-orphan'),
                            primaryjoin='foreign(OrderProduct.order_id) == remote(Order.id)')

    product_id = db.Column(db.Integer)
    product = db.relationship('Product', backref=db.backref('orderproduct_product_set'),
                              primaryjoin='foreign(OrderProduct.product_id) == remote(Product.id)')

    pd_price = db.Column(db.Integer, default="")
    pd_subtotal_price = db.Column(db.Integer, default="")
    pd_subtotal_quantity = db.Column(db.Integer, default="")

    op_subtotal_price = db.Column(db.Integer, default="")

    line_price = db.Column(db.Integer, default="")


class OrderProductOption(BaseModel):
    __tablename__ = 'order_productoptions'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref=db.backref('user_orderproductoption_set'))

    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    order = db.relationship('Order', backref=db.backref('order_orderproductoption_set', cascade='all, delete-orphan'),
                            primaryjoin='foreign(OrderProductOption.order_id) == remote(Order.id)')

    product_id = db.Column(db.Integer)
    orderproduct = db.relationship('OrderProduct', backref=db.backref('orderoption_orderproduct_set', cascade='all, delete-orphan'),
                                   primaryjoin='foreign(OrderProductOption.product_id) == remote(OrderProduct.product_id)')

    option_id = db.Column(db.Integer)
    option = db.relationship('ProductOption', backref=db.backref('orderoption_option_set'),
                             primaryjoin='foreign(OrderProductOption.option_id) == remote(ProductOption.id)')

    op_title = db.Column(db.String(100), nullable=False)
    op_price = db.Column(db.Integer, default=0)
    op_quantity = db.Column(db.Integer, default=0)
    op_line_price = db.Column(db.Integer, default=0)


class OrderTransaction(BaseModel):
    __tablename__ = 'order_transactions'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user = db.relationship('User', backref=db.backref('user_ordertransaction_set'))

    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=True)
    order = db.relationship('Order', backref=db.backref('order_ordertransaction_set'),
                            primaryjoin='foreign(OrderTransaction.order_id) == remote(Order.id)')

    amount = db.Column(db.Integer)
    merchant_order_id = db.Column(db.String(250), nullable=False)

    transaction_id = db.Column(db.String(120), nullable=True)
    transaction_status = db.Column(db.String(120), nullable=True)
    type = db.Column(db.String(120), default="none")
    device = db.Column(db.String(120), nullable=True)

    is_success = db.Column(db.Boolean(), nullable=False, default=False)
    cancel_amount = db.Column(db.Integer, default=0)
    is_cancel = db.Column(db.Boolean(), nullable=False, default=False)


class CancelPayOrder(BaseModel):
    __tablename__ = 'cancelpay_orders'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    user = db.relationship('User', backref=db.backref('user_cancelpay_set'))

    order_id = db.Column(db.Integer)
    order = db.relationship('Order', backref=db.backref('cancelpay_order_set', cascade='all, delete-orphan'),
                            primaryjoin='foreign(CancelPayOrder.order_id) == remote(Order.id)')

    ordertransaction_id = db.Column(db.Integer)
    ordertransaction = db.relationship('OrderTransaction', backref=db.backref('cancelpay_ordertransaction_set', cascade='all, delete-orphan'),
                                       primaryjoin='foreign(CancelPayOrder.ordertransaction_id) == remote(OrderTransaction.id)')

    order_title = db.Column(db.String(120))
    buyer_name = db.Column(db.String(120))
    cancel_amount = db.Column(db.Integer)
    cancel_reason = db.Column(db.String(120))
    merchant_uid = db.Column(db.String(250), nullable=False)
    type = db.Column(db.String(120), default="none")

    card_name = db.Column(db.String(120))
    card_number = db.Column(db.String(120))

    refund_holder = db.Column(db.String(120))
    refund_bank = db.Column(db.String(120))
    refund_account = db.Column(db.String(120))

    is_success = db.Column(db.Boolean(), nullable=False, default=False)


class CustomerUid(BaseModel):
    __tablename__ = 'customer_uids'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    user = db.relationship('User', backref=db.backref('user_customeruid_set'))

    card_number = db.Column(db.String(120))
    card_expiry = db.Column(db.String(120))
    customer_uid = db.Column(db.String(250))