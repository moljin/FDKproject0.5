from flask import Blueprint, render_template, request, redirect, url_for, abort, flash
from sqlalchemy import desc

from flask_www.accounts.forms import ProfilesForm
from flask_www.accounts.models import Profile, User, ProfileCoverImage
from flask_www.accounts.utils import admin_required, new_profile_cover_image_save
from flask_www.admin.accounts.utils import admin_profile_save
from flask_www.commons.utils import existing_img_and_dir_delete_for_update, save_file, existing_cover_image_save
from flask_www.configs import db
from flask_www.configs.config import NOW

NAME = 'admin_profiles'
admin_profiles_bp = Blueprint(NAME, __name__, url_prefix='/admin')


@admin_profiles_bp.route('/profiles/list', methods=['GET'])
@admin_required
def _list():
    profile_objs = Profile.query.order_by(desc(Profile.id)).all()
    return render_template('admin/accounts/profiles/list.html', profiles=profile_objs)


@admin_profiles_bp.route('/profiles/<int:_id>/change', methods=['GET'])
@admin_required
def change(_id):
    form = ProfilesForm()
    user_objs = User.query.all()
    profile_obj = Profile.query.filter_by(id=_id).first()
    levels = ['일반이용자', '심사중 판매사업자', '판매사업자']
    cover_img_obj = db.session.query(ProfileCoverImage).filter_by(profile_id=profile_obj.id).first()
    return render_template('admin/accounts/profiles/change.html',
                           form=form,
                           users=user_objs,
                           target_profile=profile_obj,
                           levels=levels,
                           cover_img=cover_img_obj)


@admin_profiles_bp.route('/profiles/create', methods=['GET'])
@admin_required
def create():
    form = ProfilesForm()
    user_objs = User.query.all()
    levels = ['일반이용자', '심사중 판매사업자', '판매사업자']
    return render_template('admin/accounts/profiles/create.html', form=form, users=user_objs, levels=levels)


@admin_profiles_bp.route('/profiles/save', methods=['POST'])  # 프로필이미지경로: profile_images, 등록증경로: profile
@admin_required
def save():
    if request.method == 'POST':
        req_email = request.form.get("user_email")
        req_user = User.query.filter_by(email=req_email).first()
        print("req_user", req_user)

        req_profile_id = request.form.get("_id")
        target_profile = Profile.query.filter_by(id=req_profile_id).first()
        req_nickname = request.form.get("nickname")
        message = request.form.get("message")
        level = request.form.get("level")
        profile_image = request.files.get("profile_image")
        req_corp_brand = request.form.get("corp_brand")
        corp_email = request.form.get("corp_email")
        corp_online_marketing_number = request.form.get("corp_online_marketing_number")
        corp_number = request.form.get("corp_number")
        corp_image = request.files.get("corp_image")
        corp_address = request.form.get("corp_address")
        main_phonenumber = request.form.get("main_phonenumber")
        main_cellphone = request.form.get("main_cellphone")
        cover_image1 = request.files.get("cover_image1")
        cover_image2 = request.files.get("cover_image2")
        cover_image3 = request.files.get("cover_image3")

        existing_nickname_profile = Profile.query.filter_by(nickname=req_nickname).first()
        existing_corp_brand_profile = Profile.query.filter_by(corp_brand=req_corp_brand).first()

        if target_profile:
            target_user = User.query.get_or_404(target_profile.user_id)
            if existing_nickname_profile and existing_corp_brand_profile:
                if (req_nickname != target_profile.nickname) and (req_corp_brand != target_profile.corp_brand):
                    flash("동일한 닉네임과 상호명이 존재합니다.")
                    return redirect(request.referrer)
            if existing_nickname_profile:
                if req_nickname != target_profile.nickname:
                    flash("동일한 닉네임이 존재합니다.")
                    return redirect(request.referrer)
            if existing_corp_brand_profile:
                if req_corp_brand != target_profile.corp_brand:
                    flash("동일한 상호명이 존재합니다.")
                    return redirect(request.referrer)
            if req_nickname and not existing_nickname_profile:
                target_profile.nickname = req_nickname
            if message:
                target_profile.message = message
            admin_profile_save(target_profile, level, req_corp_brand, corp_email, corp_online_marketing_number, corp_number, corp_address, main_phonenumber, main_cellphone)
            existing_profile_img_path = target_profile.image_path
            if profile_image:
                request_path = "profile_images"
                if existing_profile_img_path:
                    profile_relative_path = existing_img_and_dir_delete_for_update(existing_profile_img_path, profile_image, request_path, target_user)
                    target_profile.image_path = profile_relative_path
                else:
                    relative_path, _ = save_file(NOW, profile_image, request_path, target_user)
                    target_profile.image_path = relative_path
            existing_corp_image_path = target_profile.corp_image_path
            if corp_image:
                request_path = "corp_images"
                if existing_corp_image_path:
                    corp_image_relative_path = existing_img_and_dir_delete_for_update(existing_corp_image_path, corp_image, request_path, target_user)
                    target_profile.corp_image_path = corp_image_relative_path
                else:
                    corp_image_relative_path, _ = save_file(NOW, corp_image, request_path, target_user)
                    target_profile.corp_image_path = corp_image_relative_path
            db.session.add(target_profile)

            existing_cover_img = db.session.query(ProfileCoverImage).filter_by(profile_id=target_profile.id).first()
            request_pci_path = "profile_cover_images"
            if existing_cover_img:
                existing_cover_image_save(existing_cover_img, cover_image1, cover_image2, cover_image3, request_pci_path, target_user)
                db.session.add(existing_cover_img)
            else:
                new_profile_cover_image_save(target_user, target_profile, cover_image1, cover_image2, cover_image3, request_pci_path)

            db.session.commit()
            return redirect(request.referrer)
        else:
            if existing_nickname_profile and existing_corp_brand_profile:
                flash("동일한 닉네임과 상호명이 존재합니다.")
                return redirect(request.referrer)
            if existing_nickname_profile:
                flash("동일한 닉네임이 존재합니다.")
                return redirect(request.referrer)
            if existing_corp_brand_profile:
                flash("동일한 상호명이 존재합니다.")
                return redirect(request.referrer)
            new_profile = Profile(
                nickname=req_nickname,
                message=message,
                user_id=req_user.id
            )
            admin_profile_save(new_profile, level, req_corp_brand, corp_email, corp_online_marketing_number, corp_number, corp_address, main_phonenumber, main_cellphone)

            if profile_image:
                request_path = "profile_images"
                relative_path, _ = save_file(NOW, profile_image, request_path, req_user)
                new_profile.image_path = relative_path
            if corp_image:
                request_path = "corp_images"
                corp_image_relative_path, _ = save_file(NOW, corp_image, request_path, req_user)
                new_profile.corp_image_path = corp_image_relative_path
            db.session.add(new_profile)
            db.session.commit()

            request_pci_path = "profile_cover_images"
            new_profile_cover_image_save(req_user, new_profile, cover_image1, cover_image2, cover_image3, request_pci_path)

            db.session.commit()
            return redirect(url_for("admin_profiles.change", _id=new_profile.id))
    else:
        abort(404)
