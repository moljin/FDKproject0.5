from flask_login import UserMixin

from flask_www.commons.models import BaseModel
from flask_www.configs import db


class User(BaseModel, UserMixin):
    __tablename__ = 'users'
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(110), nullable=False)
    auth_token = db.Column(db.String(110), nullable=True)
    password_token = db.Column(db.String(110), nullable=True)
    admin_token = db.Column(db.String(110), nullable=True)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    is_staff = db.Column(db.Boolean(), default=False, nullable=False)
    is_admin = db.Column(db.Boolean(), default=False, nullable=False)

    def __init__(self, email, password):
        self.email = email
        self.password = password

    def __repr__(self):
        return f"<User('{self.id}', '{self.email}')>"


LEVELS = ('일반이용자', '심사중 판매사업자', '판매사업자')


class Profile(BaseModel):
    __tablename__ = 'profiles'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('profile_user_set'))

    nickname = db.Column(db.String(100), nullable=False, unique=True)
    image_path = db.Column(db.String(200), nullable=True)
    message = db.Column(db.Text, nullable=False)
    level = db.Column(db.String(200), nullable=False, default=LEVELS[0])

    corp_brand = db.Column(db.String(120), nullable=True)
    corp_email = db.Column(db.String(120), nullable=True)
    corp_number = db.Column('사업자등록번호', db.String(20), nullable=True)
    corp_online_marketing_number = db.Column('통신판매업번호', db.String(30), nullable=True)
    corp_image_path = db.Column('사업자등록증', db.String(200), nullable=True)
    corp_address = db.Column(db.String(120), nullable=True)
    main_phonenumber = db.Column(db.String(20), nullable=True)
    main_cellphone = db.Column(db.String(20), nullable=True)

    def __init__(self, nickname, message, user_id):
        self.user_id = user_id
        self.nickname = nickname
        self.message = message

    def __repr__(self):
        return f"<Profile('{self.id}', '{self.nickname}')>"


class ProfileCoverImage(BaseModel):
    __tablename__ = 'profile_cover_images'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('profile_cover_image_user_set'))

    profile_id = db.Column(db.Integer)
    profile = db.relationship('Profile', backref=db.backref('profile_profile_cover_image_set', cascade='all, delete-orphan'),
                              primaryjoin='foreign(ProfileCoverImage.profile_id) == remote(Profile.id)')

    image_1_path = db.Column(db.String(200), nullable=True)
    image_2_path = db.Column(db.String(200), nullable=True)
    image_3_path = db.Column(db.String(200), nullable=True)
