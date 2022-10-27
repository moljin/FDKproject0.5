from flask import url_for, render_template
from flask_mail import Message
from flask_www.configs import db, mail
from flask_www.configs.config import Config


def admin_user_save(user, auth_token, password_token, admin_token, is_verified, is_staff, is_admin):
    if auth_token is not None:
        user.auth_token = auth_token
    if password_token is not None:
        user.password_token = password_token
    if admin_token is not None:
        user.admin_token = admin_token
    print("is_verified", is_verified)
    print("is_staff", is_staff)
    print("is_admin", is_admin)
    """checked 이면 on, not checked 이면 None 으로 리턴된다."""
    if is_verified is not None:
        user.is_verified = True
    else:
        user.is_verified = False

    if is_staff is not None:
        user.is_staff = True
    else:
        user.is_staff = False

    if is_admin is not None:
        user.is_admin = True
    else:
        user.is_admin = False
    db.session.add(user)
    db.session.commit()


link = ""


def admin_send_mail(subject, authorizer_email, token, msg_txt, msg_html, add_if, req_email, is_staff, is_admin):
    global link
    msg = Message(subject, sender=Config().MAIL_USERNAME, recipients=[authorizer_email])
    if add_if == "auth_permission" or "not_admin":
        link = url_for('admin_accounts.auth_confirm',
                       token=token,
                       add_if=add_if,
                       req_email=req_email,
                       is_staff=is_staff,
                       is_admin=is_admin,
                       _external=True)
    else:
        link = None
    msg.body = render_template(msg_txt)
    msg.html = render_template(msg_html,
                               link=link,
                               email=authorizer_email,
                               add_if=add_if,
                               req_email=req_email,
                               is_staff=is_staff,
                               is_admin=is_admin)
    mail.send(msg)

    # return True


def is_admin_true_save(user_obj):
    user_obj.is_admin = True
    db.session.add(user_obj)
    db.session.commit()


def is_staff_true_save(user_obj):
    user_obj.is_staff = True
    db.session.add(user_obj)
    db.session.commit()


def is_admin_staff_true_save(user_obj):
    user_obj.is_admin = True
    user_obj.is_staff = True
    db.session.add(user_obj)
    db.session.commit()


def is_admin_false_save(user_obj):
    user_obj.is_admin = False
    db.session.add(user_obj)
    db.session.commit()


def is_staff_false_save(user_obj):
    user_obj.is_staff = False
    db.session.add(user_obj)
    db.session.commit()


def is_admin_staff_false_save(user_obj):
    user_obj.is_admin = False
    user_obj.is_staff = False
    db.session.add(user_obj)
    db.session.commit()


def admin_profile_save(profile, level, req_corp_brand, corp_email, corp_online_marketing_number, corp_number, corp_address, main_phonenumber, main_cellphone):
    if level:
        profile.level = level
    if req_corp_brand:
        profile.corp_brand = req_corp_brand
    if corp_email:
        profile.corp_email = corp_email
    if corp_online_marketing_number:
        profile.corp_online_marketing_number = corp_online_marketing_number
    if corp_number:
        profile.corp_number = corp_number
    if corp_address:
        profile.corp_address = corp_address
    if main_phonenumber:
        profile.main_phonenumber = main_phonenumber
    if main_cellphone:
        profile.main_cellphone = main_cellphone






