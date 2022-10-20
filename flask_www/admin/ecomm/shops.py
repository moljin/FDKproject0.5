from flask import Blueprint, render_template, request, abort, redirect, flash, url_for
from sqlalchemy import desc

from flask_www.accounts.models import User
from flask_www.accounts.utils import admin_required
from flask_www.admin.ecomm.utils import admin_shopcategory_save
from flask_www.commons.utils import save_file, existing_img_and_dir_delete_for_update, existing_cover_image_save
from flask_www.configs import db
from flask_www.configs.config import NOW
from flask_www.ecomm.products.forms import ShopCategoryForm
from flask_www.ecomm.products.models import ShopCategory, ShopCategoryCoverImage
from flask_www.ecomm.products.utils import new_shop_cover_image_save

NAME = 'admin_shops'
admin_shops_bp = Blueprint(NAME, __name__, url_prefix='/admin/shops')


@admin_shops_bp.route('/category/list', methods=['GET'])
@admin_required
def shop_list():
    form = ShopCategoryForm()
    shop_objs = ShopCategory.query.order_by(desc(ShopCategory.id)).all()
    return render_template('admin/products/shop_list.html', form=form, shops=shop_objs)


@admin_shops_bp.route('/category/<int:_id>/change', methods=['GET'])
@admin_required
def shop_change(_id):
    form = ShopCategoryForm()
    user_objs = User.query.all()
    shop_obj = ShopCategory.query.filter_by(id=_id).first()
    user_obj = User.query.filter_by(id=shop_obj.user_id).first()
    cover_img_obj = db.session.query(ShopCategoryCoverImage).filter_by(shopcategory_id=shop_obj.id).first()
    return render_template('admin/products/shop_change.html',
                           form=form,
                           target_user=user_obj,
                           users=user_objs,
                           target_shop=shop_obj,
                           cover_img=cover_img_obj)


@admin_shops_bp.route('/category/create', methods=['GET'])
@admin_required
def shop_create():
    form = ShopCategoryForm()
    user_objs = User.query.all()
    return render_template('admin/products/shop_create.html', form=form, users=user_objs)


@admin_shops_bp.route('/category/save', methods=['POST'])  # 프로필이미지경로: profile_images, 등록증경로: profile
@admin_required
def save():
    if request.method == 'POST':
        req_email = request.form.get("user_email")
        req_user = User.query.filter_by(email=req_email).first()
        print("req_user", req_user)

        req_shop_id = request.form.get("_id")
        target_shop = ShopCategory.query.filter_by(id=req_shop_id).first()
        print("target_shop", target_shop)
        req_title = request.form.get("title")

        content = request.form.get("content")
        meta_description = request.form.get("meta_description")
        symbol_image = request.files.get("symbol_image")
        view_count = request.form.get("view_count")
        available_display = request.form.get("available_display")
        print("available_display", available_display)

        cover_image1 = request.files.get("cover_image1")
        cover_image2 = request.files.get("cover_image2")
        cover_image3 = request.files.get("cover_image3")

        existing_title_shop = ShopCategory.query.filter_by(title=req_title).first()

        if target_shop:
            target_user = User.query.get_or_404(target_shop.user_id)
            if existing_title_shop:
                if req_title != target_shop.title:
                    flash("동일한 상점이름이 존재합니다.")
                    return redirect(request.referrer)
            if req_title and not existing_title_shop:
                target_shop.title = req_title
            admin_shopcategory_save(target_shop, content, meta_description, view_count, available_display)

            existing_symbol_path = target_shop.symbol_path
            if symbol_image:
                request_path = "shopcategory_symbol_images"
                if existing_symbol_path:
                    symbol_relative_path = existing_img_and_dir_delete_for_update(existing_symbol_path, symbol_image, request_path, target_user)
                    target_shop.symbol_path = symbol_relative_path
                else:
                    relative_path, _ = save_file(NOW, symbol_image, request_path, target_user)
                    target_shop.symbol_path = relative_path
            db.session.add(target_shop)

            existing_cover_img = db.session.query(ShopCategoryCoverImage).filter_by(shopcategory_id=target_shop.id).first()
            request_pci_path = "shopcategory_cover_images"
            if existing_cover_img:
                existing_cover_image_save(existing_cover_img, cover_image1, cover_image2, cover_image3, request_pci_path, target_user)
                db.session.add(existing_cover_img)
            else:
                new_shop_cover_image_save(target_user, target_shop, cover_image1, cover_image2, cover_image3, request_pci_path)

            db.session.commit()
            return redirect(request.referrer)

        else:
            if existing_title_shop:
                flash("동일한 상점이름이 존재합니다.")
                return redirect(request.referrer)
            new_shop = ShopCategory(
                title=req_title,
                user_id=req_user.id
            )
            admin_shopcategory_save(new_shop, content, meta_description, view_count, available_display)

            if symbol_image:
                request_path = "shopcategory_symbol_images"
                relative_path, _ = save_file(NOW, symbol_image, request_path, req_user)
                new_shop.symbol_path = relative_path
            db.session.add(new_shop)
            db.session.commit()

            request_pci_path = "shopcategory_cover_images"
            new_shop_cover_image_save(req_user, new_shop, cover_image1, cover_image2, cover_image3, request_pci_path)

            db.session.commit()
            return redirect(url_for("admin_shops.shop_change", _id=new_shop.id))
    else:
        abort(404)
