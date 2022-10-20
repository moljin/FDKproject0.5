from flask_www.commons.models import BaseModel
from flask_www.commons.utils import c_slugify
from flask_www.configs import db


shopcategory_subscriber = db.Table(
    'shopcategory_subscriber',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('shopcategory_id', db.Integer, db.ForeignKey('shopcategories.id', ondelete='CASCADE'), primary_key=True)
)


class ShopCategory(BaseModel):
    __tablename__ = 'shopcategories'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('shopcategory_user_set'))

    title = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    meta_description = db.Column(db.Text, nullable=True)

    symbol_path = db.Column(db.String(200), nullable=True)
    view_count = db.Column(db.Integer, default=0)

    available_display = db.Column('Display', db.Boolean(), nullable=False, default=True)

    subscribers = db.relationship('User', secondary=shopcategory_subscriber, backref=db.backref('shopcategory_subscriber_set'))

    def __init__(self, user_id, title):
        self.user_id = user_id
        self.title = title
        self.slug = c_slugify(self.title, allow_unicode=True)

    def __repr__(self):
        return f"<ShopCategory('{self.id}', '{self.title}')>"


class ShopCategoryCoverImage(BaseModel):
    __tablename__ = 'shopcategory_cover_images'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('shopcategory_cover_image_user_set'))

    shopcategory_id = db.Column(db.Integer)
    shopcategory = db.relationship('ShopCategory', backref=db.backref('shopcategory_shopcategory_cover_image_set', cascade='all, delete-orphan'),
                                   primaryjoin='foreign(ShopCategoryCoverImage.shopcategory_id) == remote(ShopCategory.id)')

    image_1_path = db.Column(db.String(200), nullable=True)
    image_2_path = db.Column(db.String(200), nullable=True)
    image_3_path = db.Column(db.String(200), nullable=True)


product_voter = db.Table(
    'product_voter',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('products.id', ondelete='CASCADE'), primary_key=True)
)


class Product(BaseModel):
    __tablename__ = 'products'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('product_user_set'))

    shopcategory_id = db.Column(db.Integer, db.ForeignKey('shopcategories.id', ondelete='CASCADE'), nullable=False)
    shopcategory = db.relationship('ShopCategory', backref=db.backref('shopcategory_product_set'),  # , cascade='all, delete-orphan'
                                   primaryjoin='foreign(Product.shopcategory_id) == remote(ShopCategory.id)')

    title = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)

    meta_description = db.Column(db.Text, nullable=True)
    image_1_path = db.Column(db.String(200), nullable=True)
    image_2_path = db.Column(db.String(200), nullable=True)
    image_3_path = db.Column(db.String(200), nullable=True)
    view_count = db.Column(db.Integer, default=0)

    orm_id = db.Column(db.String(250), nullable=True)

    price = db.Column(db.Integer, nullable=True)# default="")
    stock = db.Column(db.Integer)
    base_dc_amount = db.Column(db.Integer, nullable=True)  # 기본 할인금액
    delivery_pay = db.Column(db.Integer, nullable=True)  # 배송비

    available_display = db.Column('Display', db.Boolean(), nullable=False, default=True)
    available_order = db.Column('Order', db.Boolean(), nullable=False, default=True)

    voters = db.relationship('User', secondary=product_voter, backref=db.backref('product_voter_set'))

    def __init__(self, user_id, title):
        self.user_id = user_id
        self.title = title
        self.slug = c_slugify(self.title, allow_unicode=True)

    def __repr__(self):
        return f"<Product('ID: {self.id}', 제목: '{self.title}')>"

    @classmethod
    def get_option(cls):
        return ProductOption.query.filter_by(product_id=cls.id).one()


class UnitsProductImage(BaseModel):
    __tablename__ = 'units_product_images'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('unitsproductimage_user_set'))

    image_path = db.Column(db.String(350), nullable=False)  # 임시로 한번 저장하고 넘어가야 하기 때문에 nullable=True.
    original_filename = db.Column(db.String(350), nullable=False)

    orm_id = db.Column(db.String(250), nullable=False)
    unitsproductimage = db.relationship('Product', backref=db.backref('product_unitsproductimage_set', cascade='all, delete-orphan'),
                                        primaryjoin='foreign(UnitsProductImage.orm_id) == remote(Product.orm_id)')


class ProductOption(BaseModel):
    __tablename__ = 'product_options'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('productoption_user_set'))

    product_id = db.Column(db.Integer, default=0)
    product = db.relationship('Product', backref=db.backref('productoption_product_set', cascade='all, delete-orphan'),
                              primaryjoin='foreign(ProductOption.product_id) == remote(Product.id)')

    title = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, default="")
    stock = db.Column(db.Integer)

    available_display = db.Column('Display', db.Boolean(), nullable=False, default=True)
    available_order = db.Column('Order', db.Boolean(), nullable=False, default=True)

    is_deleted = db.Column(db.Boolean(), nullable=False, default=False)

    def __init__(self, user_id, title):
        self.user_id = user_id
        self.title = title
        self.slug = c_slugify(self.title, allow_unicode=True)

    def __repr__(self):
        return f"<ProductOption('ID: {self.id}', 제목: '{self.title}')>"

    @classmethod
    def get_product(cls):
        return Product.query.filter_by(id=cls.product_id).one()


class ProductReview(BaseModel):
    __tablename__ = 'product_reviews'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('productreview_user_set'))

    content = db.Column(db.Text(), nullable=False)

    product_id = db.Column(db.Integer, default=0)
    product = db.relationship('Product', backref=db.backref('productreview_product_set', cascade='all, delete-orphan'),
                              primaryjoin='foreign(ProductReview.product_id) == remote(Product.id)')


