import os
import shutil

from flask import Blueprint, g, redirect, url_for, render_template, request, abort, session, make_response, jsonify, flash
from flask_login import current_user
from sqlalchemy import desc

from flask_www.accounts.forms import ProfilesForm
from flask_www.accounts.models import Profile, User, LEVELS, ProfileCoverImage
from flask_www.accounts.utils import login_required, send_mail_for_any, profile_delete, new_profile_cover_image_save
from flask_www.commons.ownership_required import profile_ownership_required
from flask_www.commons.utils import save_file, ajax_post_key, flash_form_errors, existing_img_and_dir_delete_for_update, existing_img_and_dir_delete_without_update, existing_cover_image_save
from flask_www.configs import db
from flask_www.configs.config import NOW, BASE_DIR, SUPER_ADMIN_EMAIL
from flask_www.ecomm.products.models import ShopCategory, Product
from flask_www.ecomm.products.utils import shop_disable_save, product_disable_save

NAME = 'profiles'
profiles_bp = Blueprint(NAME, __name__, url_prefix='/accounts')

data_response = ""


@profiles_bp.route('/profile/create', methods=['GET', 'POST'])
@login_required
def create():
    form = ProfilesForm()
    nickname = form.nickname.data
    existing_nickname_profile = Profile.query.filter_by(nickname=nickname).first()
    message = form.message.data
    try:
        if existing_nickname_profile:
            flash("동일한 닉네임이 존재합니다.")
        elif request.method == 'POST':# form.validate_on_submit():
            new_profile = Profile(
                nickname=nickname,
                message=message,
                user_id=g.user.id
            )
            db.session.add(new_profile)
            db.session.commit()
            return redirect(url_for('profiles.detail', _id=new_profile.id))
        else:
            flash_form_errors(form)
    except Exception as e:
        print(e)
    return render_template('accounts/profiles/profile_create.html', form=form)


@profiles_bp.route('/profile_images/save/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def profile_img_save_ajax(_id):
    ajax_post_key()
    post_key = session["ajax_post_key"]

    profile = db.session.query(Profile).filter_by(id=_id).first()
    existing_profile_img_path = profile.image_path
    if post_key and request.method == 'POST':
        profile_image = request.files.get('profile_image')
        if existing_profile_img_path:
            request_path = "profile_images"
            profile_relative_path = existing_img_and_dir_delete_for_update(existing_profile_img_path, profile_image, request_path, current_user)
            profile.image_path = profile_relative_path
        else:
            if profile_image:
                request_path = "profile_images"
                relative_path, _ = save_file(NOW, profile_image, request_path, current_user)
                profile.image_path = relative_path
        db.session.add(profile)
        db.session.commit()
        session.pop('ajax_post_key', None)
        profile_data_response = {
            "image_path": profile.image_path,
        }
        return make_response(jsonify(profile_data_response))
    abort(401)


@profiles_bp.route('/profile_images/delete/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def profile_img_delete_ajax(_id):
    profile = db.session.query(Profile).filter_by(id=_id).first()
    existing_profile_img_path = profile.image_path
    if request.method == 'POST':
        if existing_profile_img_path:
            try:
                existing_img_and_dir_delete_without_update(existing_profile_img_path)
                profile.image_path = ""
            except Exception as e:
                print(e)
        db.session.add(profile)
        db.session.commit()
        profile_data_response = {
            "image_path": "static/statics/images/user_none.png" # 맨앞 / 를 빼고 넘긴다. ...
        }
        return make_response(jsonify(profile_data_response))
    abort(401)


@profiles_bp.route('/profile/detail/<int:_id>', methods=['GET'])
def detail(_id):
    profile_obj = db.session.query(Profile).filter_by(id=_id).first()
    user_id = profile_obj.user_id
    user_obj = User.query.get_or_404(user_id)
    cover_img_obj = db.session.query(ProfileCoverImage).filter_by(profile_id=profile_obj.id).first()
    shopcategory_objs = db.session.query(ShopCategory).filter_by(user_id=user_obj.id).all()  # .order_by(desc(ShopCategory.created_at))
    return render_template('accounts/profiles/profile_detail.html',
                           target_profile_user=user_obj,
                           target_profile=profile_obj,
                           shopcategory_objs=shopcategory_objs,
                           cover_img=cover_img_obj)


@profiles_bp.route('/profile/vendor/not', methods=['GET'])
@login_required
def vendor_not():
    _id = current_user.id
    user_obj = User.query.get_or_404(_id)
    profile_obj = Profile.query.filter_by(user_id=user_obj.id).first()
    return render_template('accounts/profiles/vendor_not.html', user=user_obj, profile=profile_obj)


@profiles_bp.route('/profile/update/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def update_ajax(_id):
    global data_response
    user_id = current_user.id
    profile = db.session.query(Profile).filter_by(user_id=user_id).one()
    if request.method == 'POST':
        if profile:
            req_nickname = request.form.get("nickname")
            message = request.form.get("message")
            existing_nickname_profile = Profile.query.filter_by(nickname=req_nickname).first()
            if existing_nickname_profile:
                if req_nickname != profile.nickname:
                    nickname_data_response = {
                        "flash_message": "동일한 닉네임이 존재합니다.",
                    }
                    return make_response(jsonify(nickname_data_response))
            if req_nickname and message:
                profile.nickname = req_nickname
                profile.message = message
                db.session.add(profile)
                db.session.commit()

                profile_data_response = {
                    "profile_nickname": profile.nickname,
                    "profile_message": profile.message,
                    # "profile_image_path": profile.image_path,
                }
                return make_response(jsonify(profile_data_response))
            elif not req_nickname:
                data_response = {
                    "checked_message": "닉네임를 채워주세요!",
                }
            elif not message:
                data_response = {
                    "checked_message": "간단 메시지를 채워주세요!",
                }
            return make_response(jsonify(data_response))
        else:
            abort(401)


@profiles_bp.route('profile/vendor/detail/<int:_id>', methods=['GET'])
@login_required
def vendor_detail(_id):
    form = ProfilesForm()
    profile_obj = db.session.query(Profile).filter_by(id=_id).first()
    user_obj = db.session.query(User).filter_by(id=profile_obj.user_id).first()
    cover_img_obj = db.session.query(ProfileCoverImage).filter_by(profile_id=profile_obj.id).first()
    shopcategory_objs = db.session.query(ShopCategory).filter_by(user_id=user_obj.id).all()  # .order_by(desc(ShopCategory.created_at))
    return render_template('accounts/profiles/profile_detail.html',
                           target_profile_user=user_obj,
                           target_profile=profile_obj,
                           shopcategory_objs=shopcategory_objs,
                           cover_img=cover_img_obj,
                           # form=form
                           )


@profiles_bp.route('/corp_images/profile/vendor/save/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def vendor_corp_image_save_ajax(_id):
    profile = db.session.query(Profile).filter_by(id=_id).first()
    existing_corp_image_path = profile.corp_image_path
    corp_image = request.files.get('corp_image')
    if existing_corp_image_path:
        request_path = "corp_images"
        corp_image_relative_path = existing_img_and_dir_delete_for_update(existing_corp_image_path, corp_image, request_path, current_user)
        profile.corp_image_path = corp_image_relative_path

    db.session.add(profile)
    db.session.commit()
    corp_img_data_response = {
        "success_msg": "Success"
    }
    return make_response(jsonify(corp_img_data_response))


@profiles_bp.route('/profile/vendor/update/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def vendor_update_ajax(_id):
    global data_response
    profile = db.session.query(Profile).filter_by(id=_id).first()
    level = profile.level
    if request.method == 'POST':
        if profile:
            req_corp_brand = request.form.get("corp_brand")
            corp_email = request.form.get("corp_email")
            corp_number = request.form.get("corp_number")
            corp_online_marketing_number = request.form.get("corp_online_marketing_number")
            corp_address = request.form.get("corp_address")
            main_phonenumber = request.form.get("main_phonenumber")
            main_cellphone = request.form.get("main_cellphone")
            corp_image = request.files.get('corp_image')

            existing_corp_brand_profile = Profile.query.filter_by(corp_brand=req_corp_brand).first()            # if corp_brand:  # != profile.corp_brand:
            if existing_corp_brand_profile:
                if req_corp_brand != profile.corp_brand:
                    data_response = {
                        "checked_message": "동일한 상호명이 존재합니다.",
                    }
                    return make_response(jsonify(data_response))

            if req_corp_brand and corp_email and corp_number and corp_online_marketing_number and corp_address and main_phonenumber and main_cellphone:

                req_level = request.form.get('level')
                if req_level == level:
                    if profile.level == "일반이용자":
                        profile.level = LEVELS[1]  # 심사중 판매사업자로 update

                profile.corp_brand = req_corp_brand
                profile.corp_email = corp_email
                profile.corp_number = corp_number
                profile.corp_online_marketing_number = corp_online_marketing_number
                profile.corp_address = corp_address
                profile.main_phonenumber = main_phonenumber
                profile.main_cellphone = main_cellphone
                if corp_image:
                    request_path = "corp_images"
                    corp_image_relative_path, _ = save_file(NOW, corp_image, request_path, current_user)
                    profile.corp_image_path = corp_image_relative_path
                elif not corp_image:
                    if not profile.corp_image_path:
                        data_response = {
                            "checked_message": "사업자등록증을 채워주세요!",
                        }
                        return make_response(jsonify(data_response))

                db.session.add(profile)
                db.session.commit()

                add_if = "vendor_update"
                add_if_admin = "vendor_update_admin"
                subject = "판매사업자 신청 메일"
                user_email = current_user.email
                admin_email = SUPER_ADMIN_EMAIL
                token = "None"
                msg_txt = 'accounts/send_mails/mail.txt'
                msg_html = 'accounts/send_mails/accounts_mail.html'
                send_mail_for_any(subject, current_user, user_email, token, msg_txt, msg_html, add_if)
                send_mail_for_any(subject, current_user, admin_email, token, msg_txt, msg_html, add_if_admin)

                data_response = {
                    "corp_brand": profile.corp_brand,
                    "corp_email": profile.corp_email,
                    "corp_number": profile.corp_number,
                    "corp_online_marketing_number": profile.corp_online_marketing_number,
                    "corp_image_path": profile.corp_image_path,
                    "corp_address": profile.corp_address,
                    "main_phonenumber": profile.main_phonenumber,
                    "main_cellphone": profile.main_cellphone,
                    "profile_level": profile.level
                }

                return make_response(jsonify(data_response))
            elif not req_corp_brand:
                data_response = {
                    "checked_message": "상호명을 채워주세요!",
                }
                # return make_response(jsonify(data_response))
            elif not corp_email:
                data_response = {
                    "checked_message": "사업자용 이메일을 채워주세요!",
                }
                # return make_response(jsonify(data_response))
            elif not corp_number:
                data_response = {
                    "checked_message": "사업자등록번호를 채워주세요!",
                }
                # return make_response(jsonify(data_response))
            elif not corp_online_marketing_number:
                data_response = {
                    "checked_message": "통신판매업번호를 채워주세요!",
                }
                # return make_response(jsonify(data_response))
            elif not corp_address:
                data_response = {
                    "checked_message": "사업자주소를 채워주세요!",
                }
                # return make_response(jsonify(data_response))
            elif not main_phonenumber:
                data_response = {
                    "checked_message": "대표전화번호를 채워주세요!",
                }
                # return make_response(jsonify(data_response))
            elif not main_cellphone:
                data_response = {
                    "checked_message": "사업자휴대폰번호를 채워주세요!",
                }
            return make_response(jsonify(data_response))

        else:
            abort(401)


# @profiles_bp.route('/profile/existing/check/ajax/<int:_id>', methods=['POST'])
# def existing_profile_check_ajax(_id):
@profiles_bp.route('/profile/existing/check/ajax', methods=['POST'])
def existing_profile_check_ajax():
    """닉네임과 상호명을 체크하는 ajax"""
    _id = request.form.get("_id")
    profile = db.session.query(Profile).filter_by(id=_id).first()
    req_nickname = request.form.get("nickname")
    existing_nickname_profile = Profile.query.filter_by(nickname=req_nickname).first()
    req_corp_brand = request.form.get("corp_brand")
    existing_corp_brand_profile = Profile.query.filter_by(corp_brand=req_corp_brand).first()
    if profile:
        if req_nickname:
            if existing_nickname_profile and (req_nickname != profile.nickname):
                nickname_data_response = {
                    "flash_message": "동일한 닉네임이 존재합니다.",
                }
            elif existing_nickname_profile and (req_nickname == profile.nickname):
                nickname_data_response = {
                    "flash_message": "닉네임이 그전과 동일해요. (사용가능)",
                }
            else:
                nickname_data_response = {
                    "flash_message": "사용가능한 닉네임입니다.",
                }
            return make_response(jsonify(nickname_data_response))
        if req_corp_brand:
            if existing_corp_brand_profile and (req_corp_brand != profile.corp_brand):
                brand_data_response = {
                    "flash_message": "동일한 상호명이 존재합니다.",
                }
            elif existing_corp_brand_profile and (req_corp_brand == profile.corp_brand):
                brand_data_response = {
                    "flash_message": "상호명이 그전과 동일해요. (사용가능)",
                }
            else:
                brand_data_response = {
                    "flash_message": "사용가능한 상호명입니다.",
                }
            return make_response(jsonify(brand_data_response))
    else:
        if req_nickname:
            if existing_nickname_profile:
                nickname_data_response = {
                    "flash_message": "동일한 닉네임이 존재합니다.",
                }
            else:
                nickname_data_response = {
                    "flash_message": "사용가능한 닉네임입니다.",
                }
            return make_response(jsonify(nickname_data_response))
        if req_corp_brand:
            if existing_corp_brand_profile:
                brand_data_response = {
                    "flash_message": "동일한 상호명이 존재합니다.",
                }
            else:
                brand_data_response = {
                    "flash_message": "사용가능한 상호명입니다.",
                }
            return make_response(jsonify(brand_data_response))


@profiles_bp.route('/profile/vendor/delete/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def vendor_delete_ajax(_id):
    profile = db.session.query(Profile).filter_by(id=_id).first()
    if request.method == 'POST':
        if profile:
            if profile.level != "일반이용자":
                profile.level = "일반이용자"
            profile.corp_brand = ""
            profile.corp_email = ""
            profile.corp_number = ""
            profile.corp_online_marketing_number = ""
            existing_corp_image_path = profile.corp_image_path
            if existing_corp_image_path:
                existing_img_and_dir_delete_without_update(existing_corp_image_path)
            profile.corp_image_path = ""

            profile.corp_address = ""
            profile.main_phonenumber = ""
            profile.main_cellphone = ""
            db.session.add(profile)
            db.session.commit()

            empty_data_response = {}
            return make_response(jsonify(empty_data_response))
        else:
            abort(401)


@profiles_bp.route('/profile_cover_images/save/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def account_cover_img_save_ajax(_id):
    ajax_post_key()
    post_key = session["ajax_post_key"]  # 존재이유:게시판을 통하지 않고... 무작정 들어와서 이미지 올리는 것 막을려고....

    profile = db.session.query(Profile).filter_by(id=_id).first()
    user_id = profile.user_id
    user = User.query.get_or_404(user_id)

    if post_key and request.method == 'POST':
        cover_img1 = request.files.get('cover_img1')
        cover_img2 = request.files.get('cover_img2')
        cover_img3 = request.files.get('cover_img3')
        existing_cover_img = db.session.query(ProfileCoverImage).filter_by(profile_id=profile.id).first()
        request_path = "profile_cover_images"
        if existing_cover_img:
            existing_cover_image_save(existing_cover_img, cover_img1, cover_img2, cover_img3, request_path, current_user)
            db.session.add(existing_cover_img)
            db.session.commit()
            session.pop('ajax_post_key', None)
            img_data_response = {
                "image_1_path": existing_cover_img.image_1_path,
                "image_2_path": existing_cover_img.image_2_path,
                "image_3_path": existing_cover_img.image_3_path,
            }
            return make_response(jsonify(img_data_response))

        else:
            request_path = "profile_cover_images"
            new_profile_cover_image_save(user, profile, cover_img1, cover_img2, cover_img3, request_path)

            db.session.commit()
            new_cover_image = ProfileCoverImage.query.filter_by(user_id=user_id).first()
            session.pop('ajax_post_key', None)
            img_data_response = {
                "image_1_path": new_cover_image.image_1_path,
                "image_2_path": new_cover_image.image_2_path,
                "image_3_path": new_cover_image.image_3_path,
            }
            return make_response(jsonify(img_data_response))
    else:
        return make_response(jsonify({"cover_img": 'else error'}))


@profiles_bp.route('/profile_cover_images/delete/ajax/<int:_id>', methods=['POST'])
@profile_ownership_required
def account_cover_img_delete_ajax(_id):
    profile = db.session.query(Profile).filter_by(id=_id).first()
    existing_cover_img = db.session.query(ProfileCoverImage).filter_by(profile_id=profile.id).first()
    if request.method == 'POST':
        if profile and existing_cover_img:
            try:
                existing_cover_img_1_path = existing_cover_img.image_1_path
                existing_cover_img_2_path = existing_cover_img.image_2_path
                existing_cover_img_3_path = existing_cover_img.image_3_path
                existing_img_and_dir_delete_without_update(existing_cover_img_1_path)
                existing_img_and_dir_delete_without_update(existing_cover_img_2_path)
                existing_img_and_dir_delete_without_update(existing_cover_img_3_path)
            except Exception as e:
                print(e)
        db.session.delete(existing_cover_img)
        db.session.commit()
        img_data_response = {
            "none_image_path": "/static/statics/images/cover-img.jpg"
        }
        return make_response(jsonify(img_data_response))
    abort(401)


# @profiles_bp.route('/profile/delete/ajax/<int:_id>', methods=['GET', 'POST'])
# @profile_ownership_required
# def delete_ajax(_id):
@profiles_bp.route('/profile/delete/ajax', methods=['GET', 'POST'])
def delete_ajax():
    """admin 과 통합함"""
    """image_path and corp_image_path, cover_image_path 둘다 삭제해야 한다. profile_delete(profile)"""
    _id = request.form.get("_id")
    target_profile = db.session.query(Profile).filter_by(id=_id).one()
    if request.method == 'POST':
        if target_profile and ((current_user.id == target_profile.user_id) or current_user.is_admin):
            target_user = db.session.query(User).filter_by(id=target_profile.user_id).one()
            profile_delete(target_profile)

            shopcategory_objs = db.session.query(ShopCategory).filter_by(user_id=target_profile.user_id).all()
            if shopcategory_objs:
                shop_disable_save(shopcategory_objs)

            product_objs = db.session.query(Product).filter_by(user_id=target_profile.user_id).all()
            if product_objs:
                product_disable_save(product_objs)

            db.session.commit()
            if current_user.id == target_profile.user_id:
                if "admin" not in request.referrer:
                    url_data_response = {
                        "redirect_url": url_for('accounts.dashboard', _id=target_user.id)
                    }
                    return make_response(jsonify(url_data_response))
            if current_user.is_admin:
                url_data_response = {
                    "redirect_url": url_for('admin_profiles._list')
                }
                return make_response(jsonify(url_data_response))
        else:
            abort(401)
