import os
import shutil
import uuid

from flask import Blueprint, render_template, flash, make_response, jsonify, redirect, url_for, g, session, request, abort
from flask_login import current_user
from sqlalchemy import desc

from flask_www.accounts.models import Profile, User
from flask_www.accounts.utils import login_required, vendor_required, admin_required
from flask_www.commons.ownership_required import shopcategory_ownership_required, product_ownership_required
from flask_www.commons.utils import flash_form_errors, save_file, ajax_post_key, base64_to_file, existing_img_and_dir_delete_for_update, existing_img_and_dir_delete_without_update, \
    existing_cover_image_save, new_three_image_save, elapsed_day
from flask_www.configs import db
from flask_www.configs.config import NOW, BASE_DIR
from flask_www.ecomm.carts.carts import _cart_id
from flask_www.ecomm.carts.models import Cart
from flask_www.ecomm.carts.utils import cart_active_check
from flask_www.ecomm.products.forms import ShopCategoryForm, ProductForm
from flask_www.ecomm.products.models import ShopCategory, ShopCategoryCoverImage, UnitsProductImage, Product, ProductOption
from flask_www.ecomm.products.utils import new_shop_cover_image_save, try_shopcategory_delete_ajax, product_partial_save, p_option_partial_save

NAME = 'products'
products_bp = Blueprint(NAME, __name__, url_prefix='/products')


@products_bp.route('/shop-category/create', methods=['GET', 'POST'])
@vendor_required
def shopcategory_create():
    form = ShopCategoryForm()
    title = form.title.data
    existing_title_shop = ShopCategory.query.filter_by(title=title).first()
    content = form.content.data
    meta_description = form.meta_description.data
    try:
        if existing_title_shop:
            flash("등록된 상점타이틀이 존재합니다.")
        elif request.method == 'POST':#form.validate_on_submit():
            new_shopcategory = ShopCategory(
                user_id=g.user.id,
                title=title
            )
            new_shopcategory.content = content
            new_shopcategory.meta_description = meta_description
            db.session.add(new_shopcategory)
            db.session.commit()

            return redirect(url_for('products.shopcategory_detail', _id=new_shopcategory.id, slug=new_shopcategory.slug))
        else:
            flash_form_errors(form)

    except Exception as e:
        print(e)
    return render_template('ecomm/products/shopcategory_create.html', form=form)


@products_bp.route('/shopcategory_symbol_images/save/ajax/<int:_id>', methods=['POST'])
@shopcategory_ownership_required
def shopcategory_symbol_img_save_ajax(_id):
    ajax_post_key()
    post_key = session["ajax_post_key"]

    shopcategory = db.session.query(ShopCategory).filter_by(id=_id).first()
    symbol_image = request.files.get('symbol_image')
    if post_key and request.method == 'POST':
        existing_symbol_img_path = shopcategory.symbol_path
        if existing_symbol_img_path:
            request_path = "shopcategory_symbol_images"
            relative_path = existing_img_and_dir_delete_for_update(existing_symbol_img_path, symbol_image, request_path)
            shopcategory.symbol_path = relative_path
        else:
            if symbol_image:
                request_path = "shopcategory_symbol_images"
                relative_path, _ = save_file(NOW, symbol_image, request_path, current_user)
                shopcategory.symbol_path = relative_path
        db.session.add(shopcategory)
        db.session.commit()
        session.pop('ajax_post_key', None)
        shop_data_response = {
            "symbol_path": shopcategory.symbol_path,
        }
        return make_response(jsonify(shop_data_response))
    abort(401)


@products_bp.route('/shopcategory_symbol_images/delete/ajax/<int:_id>', methods=['POST'])
@shopcategory_ownership_required
def shopcategory_symbol_img_delete_ajax(_id):
    shopcategory = db.session.query(ShopCategory).filter_by(id=_id).first()
    if request.method == 'POST':
        existing_symbol_img_path = shopcategory.symbol_path
        if existing_symbol_img_path:
            try:
                existing_img_and_dir_delete_without_update(existing_symbol_img_path)
                shopcategory.symbol_path = ""
            except Exception as e:
                print(e)
        db.session.add(shopcategory)
        db.session.commit()
        shop_data_response = {
            "symbol_path": "static/statics/images/sample_logo.png" # 맨앞 / 를 빼고 넘긴다. ...
        }
        return make_response(jsonify(shop_data_response))
    abort(401)


@products_bp.route('/shopcategory_cover_images/save/ajax/<int:_id>', methods=['POST'])
@shopcategory_ownership_required
def shopcategory_cover_img_save_ajax(_id):
    ajax_post_key()
    post_key = session["ajax_post_key"]  # 존재이유:게시판을 통하지 않고... 무작정 들어와서 이미지 올리는 것 막을려고....

    shopcategory = db.session.query(ShopCategory).filter_by(id=_id).first()
    user_id = shopcategory.user_id
    user = User.query.get_or_404(user_id)

    if post_key and request.method == 'POST':
        cover_img1 = request.files.get('cover_img1')
        cover_img2 = request.files.get('cover_img2')
        cover_img3 = request.files.get('cover_img3')
        existing_cover_img = db.session.query(ShopCategoryCoverImage).filter_by(shopcategory_id=shopcategory.id).first()
        request_path = "shopcategory_cover_images"
        if existing_cover_img:
            existing_cover_image_save(existing_cover_img, cover_img1, cover_img2, cover_img3, request_path, current_user)
            db.session.add(existing_cover_img)
            db.session.commit()
            session.pop('ajax_post_key', None)
            shop_data_response = {
                "image_1_path": existing_cover_img.image_1_path,
                "image_2_path": existing_cover_img.image_2_path,
                "image_3_path": existing_cover_img.image_3_path,
            }
            return make_response(jsonify(shop_data_response))

        else:
            request_path = "shopcategory_cover_images"
            new_shop_cover_image_save(user, shopcategory, cover_img1, cover_img2, cover_img3, request_path)
            db.session.commit()
            new_cover_image = ShopCategoryCoverImage.query.filter_by(user_id=user_id).first()
            session.pop('ajax_post_key', None)
            shop_data_response = {
                "image_1_path": new_cover_image.image_1_path,
                "image_2_path": new_cover_image.image_2_path,
                "image_3_path": new_cover_image.image_3_path,
            }
            return make_response(jsonify(shop_data_response))
    else:
        return make_response(jsonify({"cover_img": 'else error'}))


@products_bp.route('/shopcategory_cover_images/delete/ajax/<int:_id>', methods=['POST'])
@shopcategory_ownership_required
def shopcategory_cover_img_delete_ajax(_id):
    shopcategory = db.session.query(ShopCategory).filter_by(id=_id).first()
    existing_cover_img = db.session.query(ShopCategoryCoverImage).filter_by(shopcategory_id=shopcategory.id).first()
    if request.method == 'POST':
        if shopcategory and existing_cover_img:
            try:
                existing_img_and_dir_delete_without_update(existing_cover_img.image_1_path)
                existing_img_and_dir_delete_without_update(existing_cover_img.image_2_path)
                existing_img_and_dir_delete_without_update(existing_cover_img.image_2_path)
            except Exception as e:
                print(e)
        db.session.delete(existing_cover_img)
        db.session.commit()
        shop_data_response = {
            "none_image_path": "/static/statics/images/shop-cover.jpg"
        }
        return make_response(jsonify(shop_data_response))
    abort(401)


@products_bp.route('/shop-category/detail/<int:_id>/<slug>', methods=['GET'])
def shopcategory_detail(_id, slug):
    form = ShopCategoryForm()
    shopcategory_obj = ShopCategory.query.filter_by(id=_id, slug=slug).first()
    product_objs = Product.query.filter_by(shopcategory_id=shopcategory_obj.id).all()
    shop_user_id = shopcategory_obj.user_id
    shopcategory_obj_owner = User.query.get_or_404(shop_user_id)
    shopcategory_profile = db.session.query(Profile).filter_by(user_id=shop_user_id).first()
    cover_img_obj = db.session.query(ShopCategoryCoverImage).filter_by(shopcategory_id=shopcategory_obj.id).first()
    if shopcategory_obj_owner != current_user:
        shopcategory_obj.view_count += 1
        db.session.commit()
    return render_template('ecomm/products/shopcategory_detail.html',
                           target_shop=shopcategory_obj,
                           product_objs=product_objs,
                           form=form,
                           cover_img=cover_img_obj,
                           target_profile=shopcategory_profile)


@products_bp.route('/shop-category/existing/check/ajax', methods=['POST'])
def existing_shopcategory_check_ajax():
    """상점카테고리 타이틀을 체크하는 ajax"""
    _id = request.form.get("_id")
    shopcategory = db.session.query(ShopCategory).filter_by(id=_id).first()
    req_title = request.form.get("title")
    existing_title_shop = ShopCategory.query.filter_by(title=req_title).first()
    if shopcategory:
        if req_title:
            if existing_title_shop and (req_title != shopcategory.title):
                # flash("동일한 닉네임이 존재합니다.")
                shop_data_response = {
                    "flash_message": "동일한 상점타이틀이 존재합니다.",
                }
            elif existing_title_shop and (req_title == shopcategory.title):
                shop_data_response = {
                    "flash_message": "상점타이틀이 그전과 동일해요. (사용가능)",
                }
            else:
                # flash("사용가능한 닉네임입니다.")
                print("else========================")
                shop_data_response = {
                    "flash_message": "사용가능한 상점타이틀입니다.",
                }
            return make_response(jsonify(shop_data_response))
    else:
        if req_title:
            if existing_title_shop:
                # flash("동일한 닉네임이 존재합니다.")
                shop_data_response = {
                    "flash_message": "동일한 상점타이틀이 존재합니다.",
                }
            else:
                # flash("사용가능한 닉네임입니다.")
                print("else========================")
                shop_data_response = {
                    "flash_message": "사용가능한 상점타이틀입니다.",
                }
            return make_response(jsonify(shop_data_response))


data_response = ""


@products_bp.route('/shop-category/update/ajax/<int:_id>', methods=['POST'])
@shopcategory_ownership_required
def shopcategory_update_ajax(_id):
    global data_response
    shopcategory = db.session.query(ShopCategory).filter_by(id=_id).one()
    if request.method == 'POST':
        if shopcategory:
            title = request.form.get("title")
            content = request.form.get("content")
            meta_description = request.form.get("meta_description")
            existing_title = ShopCategory.query.filter_by(title=title).first()
            if existing_title:
                if title != shopcategory.title:
                    print("다른 유저의 동일한 상점타이틀이 존재")
                    data_response = {
                        "flash_message": "동일한 상점타이틀이 존재합니다.",
                    }
                    return make_response(jsonify(data_response))
            if title and content and meta_description:
                shopcategory.title = title
                shopcategory.content = content
                shopcategory.meta_description = meta_description
                db.session.add(shopcategory)
                db.session.commit()

                data_response = {
                    "shopcategory_title": shopcategory.title,
                    "shopcategory_content": shopcategory.content,
                    "meta_description": shopcategory.meta_description,
                }
                return make_response(jsonify(data_response))
            elif not title:
                data_response = {
                    "checked_message": "상점타이틀를 채워주세요!",
                }
            elif not content:
                data_response = {
                    "checked_message": "간단 소개글를 채워주세요!",
                }
            elif not meta_description:
                data_response = {
                    "checked_message": "메타 설명를 채워주세요!",
                }
            return make_response(jsonify(data_response))
        else:
            abort(401)


@products_bp.route('/shop-category/list', methods=['GET'])
def shopcategory_list():
    shopcategories = ShopCategory.query.order_by(desc(ShopCategory.created_at))
    return render_template('ecomm/products/shopcategory_list.html', shopcategories=shopcategories)


@products_bp.route('/shop-category/delete/ajax', methods=['POST'])
def shopcategory_delete_ajax():
    """symbol_path and cover_image_path 둘다 삭제해야 한다."""
    _id = request.form.get("_id")
    target_shopcategory = db.session.query(ShopCategory).filter_by(id=_id).first()
    owner_profile = db.session.query(Profile).filter_by(user_id=target_shopcategory.user_id).first()
    print("owner_profile", owner_profile)
    if request.method == 'POST':
        if target_shopcategory:# and ((current_user.id == owner_profile.user_id) or current_user.is_admin):
            """바로 owner_profile.user_id 로 진입하면 에러 발생"""
            """admin 에서 주인 프로필이 삭제된 샵카테고리들 때문에...."""
            if owner_profile:
                if current_user.id == owner_profile.user_id:
                    try:
                        try_shopcategory_delete_ajax(target_shopcategory)
                    except Exception as e:
                        print(e)
            if current_user.is_admin:
                try:
                    try_shopcategory_delete_ajax(target_shopcategory)
                except Exception as e:
                    print(e)
            db.session.delete(target_shopcategory)
            db.session.commit()

            if owner_profile:
                if current_user.id == owner_profile.user_id:
                    if "admin" not in request.referrer:
                        shop_data_response = {
                            "redirect_url": url_for('profiles.vendor_detail', _id=owner_profile.id)
                        }
                        return make_response(jsonify(shop_data_response))
            if current_user.is_admin:
                shop_data_response = {
                    "redirect_url": url_for('admin_shops.shop_list')
                }
                return make_response(jsonify(shop_data_response))
        abort(401)


@products_bp.route('/shop-category/subscribe/ajax/<int:_id>', methods=['POST'])
@login_required
def shopcategory_subscribe_ajax(_id):
    global data_response
    if request.method == 'POST':
        _shopcategory = ShopCategory.query.get_or_404(_id)
        if g.user == _shopcategory.user:
            data_response = {
                "checked_message": "본인이 작성한 글은 구독할수 없습니다"
            }
            return make_response(jsonify(data_response))
        else:
            if current_user in _shopcategory.subscribers:
                print("OK:: 이미 구독중")
                data_response = {
                    "checked_message": "이미 구독하고 계세요!"
                }
            else:
                print("pre-subscribe::_shopcategory.subscribers", _shopcategory.subscribers)
                _shopcategory.subscribers.append(g.user)
                db.session.commit()
                subscribe_count = len(_shopcategory.subscribers)  # 제대로 되는지 확인
                print("post-subscribe::_shopcategory.subscribers", _shopcategory.subscribers)
                print(subscribe_count)
                data_response = {
                    "subscribe_count": subscribe_count
                }
            return make_response(jsonify(data_response))
    abort(401)


@products_bp.route('/shop-category/subscribe/cancel/ajax/<int:_id>', methods=['POST'])
@login_required
def shopcategory_subscribe_cancel_ajax(_id):
    global data_response
    if request.method == 'POST':
        _shopcategory = ShopCategory.query.get_or_404(_id)
        print("pre-cancel::_shopcategory.subscribers", _shopcategory.subscribers)
        if current_user in _shopcategory.subscribers:
            _shopcategory.subscribers.remove(g.user)
            db.session.commit()
            subscribe_count = len(_shopcategory.subscribers)
            print("post-cancel::_shopcategory.subscribers", _shopcategory.subscribers)
            print("subscribe_count", subscribe_count)
            data_response = {
                "flash_message": "그동안 구독해주셔서 감사해요!",
                "subscribe_count": subscribe_count
            }
        else:
            data_response = {
                "checked_count": "구독했던 유저만 취소가 가능해요!"
            }
        return make_response(jsonify(data_response))
    abort(401)


@products_bp.route('/product/create', methods=['GET'])
@vendor_required
def product_create():
    form = ProductForm()
    sid = int(request.full_path.split("?")[1].split("&")[0].split("=")[1])
    shopcategory = ShopCategory.query.filter_by(id=sid).first()
    target_profile = Profile.query.filter_by(user_id=shopcategory.user_id).first()
    print(sid)
    products_all = Product.query.all()
    try:
        new_id = str(products_all[-1].id + 1)  # 고유해지지만, model.id와 일치하지는 않는다. 삭제된 놈들이 있으면...
    except Exception as e:
        print(e)
        new_id = str(1)
    user_id = str(g.user.id)
    random_string = str(uuid.uuid4())
    username = g.user.email.split('@')[0]
    orm_id = user_id + ":" + username + ":" + new_id + ":" + random_string
    return render_template('ecomm/products/product/create.html',
                           shopcategory=shopcategory,
                           target_profile=target_profile,
                           form=form, orm_id=orm_id)


@products_bp.route('/product/save', methods=['POST'])
@vendor_required
def product_save():
    if request.method == 'POST':  # and form.validate_on_submit():

        req_product_id = request.form.get("_id")
        target_product = Product.query.filter_by(id=req_product_id).first()
        target_options = ProductOption.query.filter_by(product_id=req_product_id).all()

        current_profile = db.session.query(Profile).filter_by(user_id=current_user.id).first()

        title = request.form.get("title")
        content = request.form.get('content')
        meta_description = request.form.get('meta_description')
        thumbnail_image1 = request.files.get("image1")
        thumbnail_image2 = request.files.get("image2")
        thumbnail_image3 = request.files.get("image3")

        price = request.form.get('price')
        stock = request.form.get('stock')
        base_dc_amount = request.form.get('base_dc_amount')
        delivery_pay = request.form.get('delivery_pay')
        available_display = request.form.get('available_display')
        available_order = request.form.get('available_order')

        op_id = request.form.getlist("op_id")
        op_title = request.form.getlist("op_title")
        op_price = request.form.getlist('op_price')
        op_stock = request.form.getlist('op_stock')

        op_available_display = request.form.getlist('op_available_display')
        op_available_order = request.form.getlist('op_available_order')

        if target_product:
            if g.user != target_product.user:# or not g.user.is_admin:
                flash('수정권한이 없습니다')
                return redirect(url_for('products.product_detail', _id=target_product.id, slug=target_product.slug))
            target_product.title = title
            product_partial_save(target_product, content, meta_description, price, stock, base_dc_amount, delivery_pay, available_display, available_order)

            request_path = "product_thumbnail_images"
            existing_image_1_path = target_product.image_1_path
            existing_image_2_path = target_product.image_2_path
            existing_image_3_path = target_product.image_3_path
            if thumbnail_image1:
                if existing_image_1_path:
                    img1_relative_path = existing_img_and_dir_delete_for_update(existing_image_1_path, thumbnail_image1, request_path, current_user)
                    target_product.image_1_path = img1_relative_path
                else:
                    img1_relative_path, _ = save_file(NOW, thumbnail_image1, request_path, current_user)
                    target_product.image_1_path = img1_relative_path
            if thumbnail_image2:
                if existing_image_2_path:
                    img2_relative_path = existing_img_and_dir_delete_for_update(existing_image_2_path, thumbnail_image2, request_path, current_user)
                    target_product.image_2_path = img2_relative_path
                else:
                    img2_relative_path, _ = save_file(NOW, thumbnail_image2, request_path, current_user)
                    target_product.image_2_path = img2_relative_path
            if thumbnail_image3:
                if existing_image_3_path:
                    img3_relative_path = existing_img_and_dir_delete_for_update(existing_image_3_path, thumbnail_image3, request_path, current_user)
                    target_product.image_3_path = img3_relative_path
                else:
                    img3_relative_path, _ = save_file(NOW, thumbnail_image3, request_path, current_user)
                    target_product.image_3_path = img3_relative_path
            db.session.commit()

            used_options = []
            # for idx, _ in enumerate(op_title):
            for idx in range(len(op_title)):
                if op_id[idx] == "none":
                    new_option = ProductOption(
                        user_id=g.user.id,
                        title=op_title[idx]
                    )
                    new_option.product_id = target_product.id
                    p_option_partial_save(new_option, idx, op_price, op_stock, op_available_display, op_available_order)

                else:
                    option_obj = ProductOption.query.get_or_404(op_id[idx])
                    option_obj.title = op_title[idx]
                    p_option_partial_save(option_obj, idx, op_price, op_stock, op_available_display, op_available_order)
                    used_options.append(option_obj)
                db.session.commit()
            try:
                unused_options = set(target_options) - set(used_options)
                if unused_options:
                    for unused_option in unused_options:
                        db.session.delete(unused_option)
                        db.session.commit()
            except Exception as e:
                print('productoption_update exception error::', e)
            """ # 저장후에 content 의 src 를, DB와 비교해서, DB 에 있으나 content 에는 없는 image(file, path)를 삭제"""
            try:
                db_img_objs_all = target_product.product_unitsproductimage_set
                content_html = target_product.content
                import lxml.html
                html = lxml.html.fromstring(content_html)
                img_tags = html.xpath("//img")
                content_img_objs_all = []
                for img_tag in img_tags:
                    file_path = "static" + img_tag.attrib["src"].split("static")[1]
                    content_img_obj = UnitsProductImage.query.filter_by(image_path=file_path).first()
                    content_img_objs_all.append(content_img_obj)
                unused_db_img_objs = set(db_img_objs_all) - set(content_img_objs_all)
                """DB_image 와 content_image 들을 비교해서 필요없는 DB_image 모두 삭제하기"""
                if unused_db_img_objs:
                    for unused_db_img_obj in unused_db_img_objs:
                        try:
                            unused_db_img_path = os.path.join(BASE_DIR, unused_db_img_obj.image_path)
                            if os.path.isfile(unused_db_img_path):
                                shutil.rmtree(os.path.dirname(unused_db_img_path))
                        except Exception as e:
                            print(e)
                        db.session.delete(unused_db_img_obj)
                        db.session.commit()
            except Exception as e:
                print('product_update exception error::', e)

            if current_profile and (current_profile.level == "판매사업자"):
                if "admin" not in request.referrer:
                    return redirect(url_for('products.product_detail', _id=target_product.id, slug=target_product.slug))
            if current_user.is_admin:
                """어드민 타겟유저의 change 페이지로 리다이렉트"""
                return redirect(url_for('products.product_detail', _id=target_product.id, slug=target_product.slug))
        else:
            shopcategory_id = int(request.form.get('shopcategory_id').split("?")[1].split("&")[0].split("=")[1])
            orm_id = request.form.get('orm_id')

            new_product = Product(
                user_id=g.user.id,
                title=title
            )
            new_product.shopcategory_id = shopcategory_id
            new_product.orm_id = orm_id
            product_partial_save(new_product, content, meta_description, price, stock, base_dc_amount, delivery_pay, available_display, available_order)

            request_path = "product_thumbnail_images"
            new_three_image_save(current_user, new_product, thumbnail_image1, thumbnail_image2, thumbnail_image3, request_path)
            db.session.commit()

            for idx in range(len(op_title)):
                new_option = ProductOption(
                    user_id=g.user.id,
                    title=op_title[idx]
                )
                new_option.product_id = new_product.id
                p_option_partial_save(new_option, idx, op_price, op_stock, op_available_display, op_available_order)
                db.session.commit()

            if current_profile and (current_profile.level == "판매사업자"):
                if "admin" not in request.referrer:
                    return redirect(url_for('products.product_detail', _id=new_product.id, slug=new_product.slug))
            if current_user.is_admin:
                """어드민 타겟유저의 change 페이지로 리다이렉트"""
                return redirect(url_for('products.product_detail', _id=new_product.id, slug=new_product.slug))
    else:
        abort(404)


@products_bp.route('/check_list_post_test/ajax', methods=['POST'])
@vendor_required
def check_list_post_test():
    param_list = request.form.get("paramList")
    print(param_list)
    data = {
        'data': "data"
    }
    return make_response(jsonify(data))


@products_bp.route('/product_units_images/save/ajax', methods=['POST'])
@vendor_required
def units_images_save_ajax():
    """sun_image_ajax이미지 저장하고,
    response로 contenteditable div의 figure > img src에 setAttribute를
    filePath로 replace시켜야 한다. 현재는 base64 data로 되어있다."""
    ajax_post_key()
    post_key = session["ajax_post_key"]
    if post_key and request.method == 'POST':
        image_string = request.form.get('upload_img')
        file_name = request.form.get('file_name')
        orm_id = request.form.get('orm_id')
        img_alt = request.form.get('alt')

        request_path = "product_units_images"
        image_path, file_name = base64_to_file(image_string, file_name, request_path, g.user)
        new_units_image = UnitsProductImage(
            user_id=g.user.id,
            orm_id=orm_id,
        )
        if image_path:
            new_units_image.image_path = image_path
            new_units_image.original_filename = file_name
        db.session.add(new_units_image)
        db.session.commit()
        session.pop('ajax_post_key', None)
        units_data_response = {
            "image_path": new_units_image.image_path,
            "orm_id": orm_id,
            "origin_filename": file_name
        }
        return make_response(jsonify(units_data_response))
    else:
        return make_response(jsonify({"image_path": 'else error'}))


@products_bp.route('/product/detail/<int:_id>/<slug>', methods=['GET'])
@login_required
def product_detail(_id, slug):
    product_obj = Product.query.filter_by(id=_id, slug=slug).first()
    product_obj_owner = User.query.get_or_404(product_obj.user_id)
    target_options = ProductOption.query.filter_by(product_id=product_obj.id).all()
    target_shopcategory = ShopCategory.query.filter_by(id=product_obj.shopcategory_id).first()
    target_profile = Profile.query.filter_by(user_id=product_obj.user_id).first()
    if product_obj_owner != current_user:
        product_obj.view_count += 1
        db.session.commit()

    try:
        cart = Cart.query.filter_by(user_id=current_user.id, is_active=True).first()
        if cart:
            cart_active_check(cart)
    except Exception as e:
        print(e)

    return render_template('ecomm/products/product/detail.html',
                           product_obj=product_obj,
                           target_options=target_options,
                           target_shopcategory=target_shopcategory,
                           target_profile=target_profile)


@products_bp.route('/product/list', methods=['GET'])
def product_list():
    products = Product.query.order_by(desc(Product.created_at))
    return render_template('ecomm/products/product/list.html', products=products)


@products_bp.route('/product/option/ajax', methods=['POST'])
def option_select_ajax():
    if request.method == 'POST':
        _id = request.form.get("_id")
        _get = request.form.get("_get")
        option = ProductOption.query.filter_by(id=_id).first()
        if option and _get and (_get == "get_option"):
            option_data_response = {
                "_id": option.id,
                "pd_id": option.product_id,
                "_title": option.title,
                "_price": option.price,
            }
            return make_response(jsonify(option_data_response))
        if _get is None:
            option_data_response = {
                "_data_r": "data",
            }
            return make_response(jsonify(option_data_response))


@products_bp.route('/product/update/<int:_id>/<slug>', methods=['GET'])
@product_ownership_required
def product_update(_id, slug):
    sss = User.query.all()
    product_obj = Product.query.filter_by(id=_id, slug=slug).first()
    target_options = ProductOption.query.filter_by(product_id=product_obj.id).all()
    target_profile = Profile.query.filter_by(user_id=product_obj.user_id).first()
    shopcategory_obj = ShopCategory.query.filter_by(id=product_obj.shopcategory_id).first()
    orm_id = product_obj.orm_id
    form = ProductForm()
    return render_template('ecomm/products/product/update.html', form=form,
                           target_profile=target_profile,
                           product_obj=product_obj,
                           target_options=target_options,
                           shopcategory=shopcategory_obj,
                           orm_id=orm_id,
                           sss=sss)


@products_bp.route('/product/delete/ajax', methods=['POST'])
def product_delete_ajax():
    _id = request.form.get("_id")
    target_product = Product.query.get_or_404(_id)
    target_shop = ShopCategory.query.get_or_404(target_product.shopcategory_id)
    owner_profile = db.session.query(Profile).filter_by(user_id=target_product.user_id).first()
    if request.method == 'POST':
        if target_product:
            """바로 owner_profile.user_id 로 진입하면 에러 발생"""
            """admin 에서 주인 프로필이 삭제된 샵카테고리들 때문에...."""
            if owner_profile:
                if current_user.id == owner_profile.user_id:
                    try:
                        if target_product.image_1_path:
                            existing_img_and_dir_delete_without_update(target_product.image_1_path)
                        if target_product.image_2_path:
                            existing_img_and_dir_delete_without_update(target_product.image_2_path)
                        if target_product.image_3_path:
                            existing_img_and_dir_delete_without_update(target_product.image_3_path)

                        existing_unitsproductimages = target_product.product_unitsproductimage_set
                        if existing_unitsproductimages:
                            for img_obj in existing_unitsproductimages:
                                try:
                                    img_path = os.path.join(BASE_DIR, img_obj.image_path)
                                    if os.path.isfile(img_path):
                                        shutil.rmtree(os.path.dirname(img_path))
                                except Exception as e:
                                    print(e)
                                db.session.delete(img_obj)
                                db.session.commit()

                    except Exception as e:
                        print(e)
            if current_user.is_admin:
                try:
                    if target_product.image_1_path:
                        existing_img_and_dir_delete_without_update(target_product.image_1_path)
                    if target_product.image_2_path:
                        existing_img_and_dir_delete_without_update(target_product.image_2_path)
                    if target_product.image_3_path:
                        existing_img_and_dir_delete_without_update(target_product.image_3_path)

                    existing_unitsproductimages = target_product.product_unitsproductimage_set
                    if existing_unitsproductimages:
                        for img_obj in existing_unitsproductimages:
                            try:
                                img_path = os.path.join(BASE_DIR, img_obj.image_path)
                                if os.path.isfile(img_path):
                                    shutil.rmtree(os.path.dirname(img_path))
                            except Exception as e:
                                print(e)
                            db.session.delete(img_obj)
                            db.session.commit()

                except Exception as e:
                    print(e)
            db.session.delete(target_product)
            db.session.commit()

            if owner_profile:
                if current_user.id == owner_profile.user_id:
                    if "admin" not in request.referrer:
                        shop_data_response = {
                            "redirect_url": url_for('products.shopcategory_detail', _id=target_shop.id, slug=target_shop.slug)
                        }
                        return make_response(jsonify(shop_data_response))
            if current_user.is_admin:
                shop_data_response = {
                    "redirect_url": url_for('admin_shops.shop_list')
                }
                return make_response(jsonify(shop_data_response))
        abort(401)


@products_bp.route('/product/vote/ajax/<int:_id>', methods=['POST'])
@login_required
def product_vote_ajax(_id):
    global data_response
    if request.method == 'POST':
        _product = Product.query.get_or_404(_id)
        if g.user == _product.user:
            data_response = {
                "checked_message": "본인 상품은 추천할수 없습니다."
            }
            return make_response(jsonify(data_response))
        else:
            if current_user in _product.voters:
                data_response = {
                    "checked_message": "이미 추천하고 계세요!"
                }
            else:
                _product.voters.append(g.user)
                db.session.commit()
                vote_count = len(_product.voters)  # 제대로 되는지 확인
                data_response = {
                    "vote_count": vote_count
                }
            return make_response(jsonify(data_response))
    abort(401)


@products_bp.route('/product/vote/cancel/ajax/<int:_id>', methods=['POST'])
@login_required
def product_vote_cancel_ajax(_id):
    global data_response
    if request.method == 'POST':
        _product = Product.query.get_or_404(_id)
        if current_user in _product.voters:
            _product.voters.remove(g.user)
            db.session.commit()
            vote_count = len(_product.voters)
            data_response = {
                "flash_message": "추천이 취소 되었어요!",
                "vote_count": vote_count
            }
        else:
            data_response = {
                "checked_count": "추천했던 유저만 취소가 가능해요!"
            }
        return make_response(jsonify(data_response))
    abort(401)



