from functools import wraps

from flask_login import current_user
from flask import flash, abort

from flask_www.accounts.models import User, Profile
from flask_www.ecomm.carts.models import Cart
from flask_www.ecomm.products.models import ShopCategory, Product
from flask_www.ecomm.promotions.models import Coupon


def account_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        user = User.query.get_or_404(_id)
        admin = User.query.filter_by(is_admin=True).first()
        if not current_user.is_authenticated:
            abort(404)
        else:
            if (user != current_user) and (admin != current_user):
            # if user != current_user:
                abort(404)
        return function(_id, *args, **kwargs)
    return decorated_function


def created_obj_ownership(obj):
    user = User.query.get_or_404(obj.user_id)
    admin = User.query.filter_by(is_admin=True).first()
    if not current_user.is_authenticated:
        abort(404)
    else:
        if (user != current_user) and (admin != current_user):
        # if user != current_user:
            abort(404)


def profile_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        profile = Profile.query.get_or_404(_id)
        created_obj_ownership(profile)
        return function(_id, *args, **kwargs)
    return decorated_function


def shopcategory_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        category = ShopCategory.query.get_or_404(_id)
        created_obj_ownership(category)
        return function(_id, *args, **kwargs)
    return decorated_function


def product_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        category = Product.query.get_or_404(_id)
        created_obj_ownership(category)
        return function(_id, *args, **kwargs)
    return decorated_function


def cart_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        coupon = Cart.query.get_or_404(_id)
        created_obj_ownership(coupon)
        return function(_id, *args, **kwargs)
    return decorated_function


def coupon_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        coupon = Coupon.query.get_or_404(_id)
        created_obj_ownership(coupon)
        return function(_id, *args, **kwargs)
    return decorated_function
"""
def category_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        category = QnaCategory.query.get_or_404(_id)
        created_obj_ownership(category)
        return function(_id, *args, **kwargs)
    return decorated_function


def question_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        question = Question.query.get_or_404(_id)
        created_obj_ownership(question)
        return function(_id, *args, **kwargs)
    return decorated_function


def answer_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        answer = Answer.query.get_or_404(_id)
        created_obj_ownership(answer)
        return function(_id, *args, **kwargs)
    return decorated_function


def question_comment_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        question_comment = QnaComment.query.get_or_404(_id)
        created_obj_ownership(question_comment)
        return function(_id, *args, **kwargs)
    return decorated_function


def answer_comment_ownership_required(function):
    @wraps(function)
    def decorated_function(_id, *args, **kwargs):
        answer_comment = QnaComment.query.get_or_404(_id)
        created_obj_ownership(answer_comment)
        return function(_id, *args, **kwargs)
    return decorated_function

"""