import re

from flask import url_for, render_template, redirect, request, session, abort
from flask_mail import Message
from flask_login import current_user
from functools import wraps

from flask_www.accounts.models import User, Profile, ProfileCoverImage
from flask_www.commons.utils import existing_img_and_dir_delete_without_update, new_three_image_save
from flask_www.configs import mail, db
from flask_www.configs.config import Config, NOW


def admin_required(function):
    @wraps(function)
    def decorator_function(*args, **kwargs):
        if current_user.is_authenticated:
            if not current_user.is_admin:
                abort(401)
        else:
            abort(401)
        return function(*args, **kwargs)
    return decorator_function


def login_required(function):
    @wraps(function)
    def decorator_function(*args, **kwargs):
        if not current_user.is_authenticated:
            try:
                session['previous_url'] = request.path  # request.referrer 을 이용하면 그 전 path 로 보낸다.
            except:
                session['previous_url'] = None
            return redirect(url_for('accounts.login', next=session['previous_url']))
        return function(*args, **kwargs)
    return decorator_function


def vendor_required(function):
    @wraps(function)
    def decorator_function(*args, **kwargs):
        try:
            logged_user_email = session['email']
            user_obj = User.query.filter_by(email=logged_user_email).first()
            profile_obj = Profile.query.filter_by(user_id=user_obj.id).first()
            # 프로필이 있지만 판매사업자가 아니면 vendor not 으로 보낸다.
            if profile_obj.level != '판매사업자':
                return redirect(url_for('profiles.vendor_not'))
            return function(*args, **kwargs)
        except Exception as e:
            print(e)
            # 로그인되어있지만 프로필 없거나, 로그인되지 않은 경우 401 로 보낸다.
            abort(401)
    return decorator_function


def existing_email_check(email):
    existing_email_user = User.query.filter_by(email=email).first()
    if existing_email_user:
        print("request.path", request.path)
        print("redirect(request.referrer)", request.referrer)
        return "Existing"


def optimal_password_check(password):
    password_reg = "^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{9,30}$"
    regex = re.compile(password_reg)
    password_reg_mat = re.search(regex, str(password))
    if not password:
        return "No Password"
    if not password_reg_mat:
        return "Not Optimal"
    else:
        return "Optimal"


link = ""
img_link = ""


def send_mail_for_any(subject, user, email, token, msg_txt, msg_html, add_if):
    """통합: 회원등록 인증메일, 비밀번호 분실시 재설정 인증메일, vendor update 알림메일"""
    global link, img_link
    msg = Message(subject, sender=Config().MAIL_USERNAME, recipients=[email])
    if (add_if == "register") or (add_if == "email_update") or (add_if == "not_verified"):
        link = url_for('accounts.confirm', token=token, add_if=add_if, _external=True)
        img_link = url_for('static', filename='statics/images/product_1.jpg', _external=True)
    elif add_if == "forget_password":
        link = url_for('accounts.confirm_email', token=token, add_if=add_if, _external=True)#, _anchor="here", _method="POST")
        img_link = url_for('static', filename='statics/images/product_1.jpg', _external=True)
    elif (add_if == "vendor_update") or add_if == "vendor_update_admin":
        link = None
    msg.body = render_template(msg_txt)
    msg.html = render_template(msg_html, link=link, img_link=img_link, user=user, email=email, add_if=add_if)# , token=token
    mail.send(msg)

    # return True


# def send_mail_for_verification(subject, email, auth_token, msg_txt, msg_html):  #, **kwargs
#     # msg = Message('Goggle0.0.1의 인증 메일입니다.', sender=Config().MAIL_USERNAME, recipients=[email])
#     msg = Message(subject, sender=Config().MAIL_USERNAME, recipients=[email])
#     a_link = url_for('accounts.accounts_confirm_email', token=auth_token, _external=True)
#     # msg.body = 'Hi paste the link to verify your account {}'.format(link)
#     # msg.body = f'Hi paste the link to verify your account {link}'
#     # content = f'Hi paste the link to verify your account {link}'
#     msg.body = render_template(msg_txt) #, **kwargs
#     msg.html = render_template(msg_html, link=a_link, email=email)#, content=content, **kwargs
#     mail.send(msg)
#
#     return True


def profile_delete(profile):
    profile_image_path = profile.image_path
    profile_corp_image_path = profile.corp_image_path
    try:
        if profile_image_path:
            existing_img_and_dir_delete_without_update(profile_image_path)
        if profile_corp_image_path:
            existing_img_and_dir_delete_without_update(profile_corp_image_path)
        existing_cover_img = db.session.query(ProfileCoverImage).filter_by(profile_id=profile.id).first()
        if existing_cover_img:
            if existing_cover_img.image_1_path:
                existing_img_and_dir_delete_without_update(existing_cover_img.image_1_path)
            if existing_cover_img.image_2_path:
                existing_img_and_dir_delete_without_update(existing_cover_img.image_2_path)
            if existing_cover_img.image_3_path:
                existing_img_and_dir_delete_without_update(existing_cover_img.image_3_path)
        db.session.delete(existing_cover_img)
    except Exception as e:
        print(e)
    db.session.delete(profile)


def is_verified_true_save(user_obj):
    user_obj.is_verified = True
    db.session.add(user_obj)
    db.session.commit()


def is_verified_false_save(user_obj):
    print("is_verified_false_save(user_obj)")
    user_obj.is_verified = False
    db.session.add(user_obj)
    db.session.commit()


def new_profile_cover_image_save(user, profile, image1, image2, image3, path):
    new_cover_image = ProfileCoverImage()
    new_cover_image.user_id = user.id
    new_cover_image.profile_id = profile.id
    new_three_image_save(user, new_cover_image, image1, image2, image3, path)
    db.session.add(new_cover_image)

