import os
import re
import shutil

from flask import render_template, Blueprint, session, redirect, url_for, g, flash, request, make_response, jsonify, abort
from flask_login import logout_user, current_user, login_user
from itsdangerous import SignatureExpired
from werkzeug import security

from flask_www.accounts.forms import LoginForm, AccountsForm, AccountsUpdateForm, PasswordUpdateForm
from flask_www.accounts.models import User, Profile, ProfileCoverImage
from flask_www.accounts.utils import login_required, send_mail_for_any, profile_delete, optimal_password_check, existing_email_check, is_verified_true_save, send_mail_for_verification
from flask_www.commons.ownership_required import account_ownership_required
from flask_www.commons.utils import flash_form_errors
from flask_www.configs import db
from flask_www.configs.config import BASE_DIR
from flask_www.ecomm.products.models import ShopCategory, Product
from flask_www.ecomm.products.utils import shop_disable_save, product_disable_save

NAME = 'accounts'
accounts_bp = Blueprint(NAME, __name__, url_prefix='/accounts')


@accounts_bp.before_app_request
def before_app_request():
    g.user = None
    email = session.get('email')
    if email:
        user = User.query.filter_by(email=email).first()
        if user:
            g.user = user
        else:
            session.pop('email', None)


@accounts_bp.route('/', methods=['GET'])  # /accounts로 진입하면 로그인 페이지로 보낸다.
def index():
    try:
        user_id = current_user.id
        profile = Profile.query.filter_by(user_id=user_id).one()
    except:
        profile = None
    return redirect(url_for(f'{NAME}.login', profile=profile))


@accounts_bp.route('/dashboard', methods=['GET', 'POST'])
@login_required
def dashboard():
    return render_template('dashboard/user_index.html')


@accounts_bp.route('/register', methods=['GET', 'POST'])
def register():
    form = AccountsForm()
    email = form.email.data
    try:
        """
        existing_email_user = User.query.filter_by(email=email).first()
        if existing_email_user:
            flash("가입된 이메일이 존재합니다.")
        """

        if request.method == 'POST':#form.validate_on_submit():
            if existing_email_check(email) == "Existing":
                flash("가입된 이메일이 존재합니다.")
                return redirect(request.referrer)
            if optimal_password_check(form.password.data) == "Not Optimal":
                flash('비밀번호는 알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상이어야 합니다.')
                return redirect(request.referrer)

            """
            password_reg = "^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{9,30}$"
            regex = re.compile(password_reg)
            password_reg_mat = re.search(regex, str(form.password.data))
            if not password_reg_mat:
                flash('비밀번호는 알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상이어야 합니다.')
                return redirect(request.path)
            """
            hashed_password = security.generate_password_hash(form.password.data)
            new_user = User(
                email=request.form.get('email'),
                password=hashed_password,
            )
            from flask_www.configs import safe_time_serializer
            auth_token = safe_time_serializer.dumps(email, salt='email-confirm')
            new_user.auth_token = auth_token
            db.session.add(new_user)
            db.session.commit()

            add_if = "register"
            subject = "β-0.0.2 회원등록 인증용 메일"

            msg_txt = 'accounts/send_mails/mail.txt'
            msg_html = 'accounts/send_mails/accounts_mail.html'
            send_mail_for_any(subject, new_user, email, auth_token, msg_txt, msg_html, add_if)
            new_user.is_verified = False
            db.session.add(new_user)
            db.session.commit()
            """
            msg_txt = 'accounts/send_mails/register/account_register_mail.txt'
            msg_html = 'accounts/send_mails/register/account_register_mail.html'
            send_mail_for_verification(subject, email, auth_token, msg_txt, msg_html)
            """
            return redirect(url_for('accounts.token_send', email=email))  # 이렇게 token_send로 이메일을 넘겨 줄수도 있다.

        else:
            print("flash_form_errors(form)")
            flash_form_errors(form)

    except Exception as e:
        print(e)
    return render_template("accounts/users/register.html", form=form)


@accounts_bp.route('/verification/token/send/<email>', methods=['GET'])
def token_send(email):
    return render_template("accounts/users/etc/token_send.html", email=email)


@accounts_bp.route('/confirm-email/<token>', methods=['GET'])
def accounts_confirm_email(token):
    """add_if 을 기준으로 redirect 페이지들이 결정된다."""
    try:
        from flask_www.configs import safe_time_serializer
        email = safe_time_serializer.loads(token, salt='email-confirm', max_age=86400)  # 24시간 cf. 60 == 60초 즉, 1분
        user_obj = User.query.filter_by(email=email).first()

        if user_obj and user_obj.is_verified:
            flash('이메일 인증이 이미 되어 있어요!')
            return redirect(url_for('accounts.login'))

        if user_obj and not user_obj.is_verified:
            is_verified_true_save(user_obj)
            flash('이메일 인증이 완료되었습니다.')
            return redirect(url_for('accounts.login'))

        else:
            flash('가입한 내용이 없거나 . . . 문제가 발생했습니다.')
    except SignatureExpired:
        confirm_expired_msg = '토큰이 죽었어요...!'
        return confirm_expired_msg
    return redirect(url_for('accounts.register'))


@accounts_bp.route('/confirm-email/<add_if>/<token>', methods=['GET'])
def confirm_email(add_if, token):
    """add_if 을 기준으로 redirect 페이지들이 결정된다."""
    try:
        from flask_www.configs import safe_time_serializer
        email = safe_time_serializer.loads(token, salt='email-confirm', max_age=86400)  # 24시간 cf. 60 == 60초 즉, 1분
        user_obj = User.query.filter_by(email=email).first()

        if user_obj and (add_if == "register") and user_obj.is_verified:
            flash('이메일 인증이 이미 되어 있어요!')
            return redirect(url_for('accounts.login'))

        if user_obj and (add_if == "register") and not user_obj.is_verified:
            is_verified_true_save(user_obj)
            flash('이메일 인증이 완료되었습니다.')
            return redirect(url_for('accounts.login'))

        if user_obj and (add_if == "email_update") and user_obj.is_verified:
            flash('이메일 인증이 이미 되어 있어요! 새로운 이메일로 로그인 가능해요!')
            return redirect(url_for('accounts.login'))

        if user_obj and (add_if == "email_update") and not user_obj.is_verified:
            is_verified_true_save(user_obj)
            flash('이메일 인증이 완료되었습니다. 새로운 이메일로 로그인 가능해요!')
            return redirect(url_for('accounts.login'))

        if user_obj and (add_if == "forget_password"):
            session['password_token'] = token
            return redirect(url_for('accounts.forget_password_update', _id=user_obj.id, password_token=token))

        if user_obj and (add_if == "not_verified") and user_obj.is_verified:
            flash('이메일 인증이 이미 되어 있어요! 새로운 비밀번호로 로그인 가능해요!')
            return redirect(url_for('accounts.login'))

        if user_obj and (add_if == "not_verified") and not user_obj.is_verified:
            # 가입 미인증 & 비번 재설정 이메일에서 "여기"클릭 ==> confirm_email 을 타고 여기로 지나간다.
            is_verified_true_save(user_obj)
            flash('이메일 인증이 완료되었습니다. 새로운 비밀번호로 로그인 가능해요!')
            return redirect(url_for('accounts.login'))

        else:
            flash('가입한 내용이 없거나 . . . 문제가 발생했습니다.')
    except SignatureExpired:
        confirm_expired_msg = '토큰이 죽었어요...!'
        return confirm_expired_msg
    return redirect(url_for('accounts.register'))  # 가입도 안된 토큰으로 시도할 때 flash를 안고 돌아간다.... #'<h1>토큰이 살아 있어요....</h1>'  # True 로 바꿔주고, 링크를 클릭하면 인증완료된다.


@accounts_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if current_user.is_authenticated:
        flash("로그인 상태입니다!")
        return redirect(url_for("commons.index"))
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if not user:
            flash('등록된 이메일이 없어요!')
            return redirect(url_for('accounts.register'))
        elif user and not user.is_verified:
            flash('이메일 인증이 되지 않았습니다. 메일을 확인하세요.')
            return redirect(url_for('accounts.login'))
        elif user and user.is_verified:
            profile = Profile.query.filter_by(user_id=user.id).first()
            if security.check_password_hash(user.password, form.password.data):
                login_user(user)
                session['email'] = user.email
                path_redirect = request.args.get("next")  # @login_required 의 url_for('accounts.login', next=request.path) 여기서 받아온거다.
                print(path_redirect)
                if path_redirect:
                    if profile:
                        return redirect(path_redirect)
                elif profile:
                    return redirect('/')
                elif not profile:
                    return redirect(url_for('profiles.create'))
            else:
                flash("비밀번호를 확인하세요 . . . ")
        else:
            flash('이메일을 확인하거나 가입후 이용하세요!!')
    else:
        flash_form_errors(form)
    return render_template('accounts/users/login.html', form=form)


@accounts_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    session.pop('email', None)
    logout_user()
    return redirect(url_for('accounts.login'))


@accounts_bp.route('/update/<int:_id>', methods=['GET', 'POST'])
@account_ownership_required
def email_update(_id):
    form = AccountsUpdateForm()
    user = User.query.get_or_404(_id)
    new_email = form.email.data
    if form.validate_on_submit():
        if new_email != user.email:
            if existing_email_check(new_email) == "Existing":
                flash("가입된 이메일이 존재합니다.")
                return redirect(request.referrer)
            user.email = new_email
            from flask_www.configs import safe_time_serializer
            auth_token = safe_time_serializer.dumps(new_email, salt='email-confirm')
            user.auth_token = auth_token
            user.is_verified = False
            db.session.commit()

            add_if = "email_update"
            subject = "β-0.0.5 이메일 변경 인증용 메일"
            msg_txt = 'accounts/send_mails/mail.txt'
            msg_html = 'accounts/send_mails/accounts_mail.html'
            # send_mail_for_verification(new_email, auth_token, msg_txt, msg_html)
            send_mail_for_any(subject, user, new_email, auth_token, msg_txt, msg_html, add_if)
            # 이미 session.get('email')까지 None 으로 됐기 때문에 session.pop('email', None)은 필요없다.
            logout_user()
            return redirect(url_for('accounts.token_send', email=new_email))
        else:
            flash('가입된 이메일과 동일해요 . . . ')
    return render_template('accounts/resetting/email_update.html', user=user, form=form)


@accounts_bp.route('/password/update/<int:_id>', methods=['GET', 'POST'])
@account_ownership_required
def password_update(_id):
    """post_login password update"""
    form = PasswordUpdateForm()
    user_obj = User.query.get_or_404(_id)
    password_reg = "^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{9,30}$"
    regex = re.compile(password_reg)
    password_reg_mat = re.search(regex, str(form.password.data))
    if not user_obj:
        flash('가입된 회원이 아니에요 . . .')
    elif form.validate_on_submit():
        if not password_reg_mat:
            flash('비밀번호는 알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상이어야 합니다.')
            return redirect(request.path)
        hashed_password = security.generate_password_hash(form.password.data)
        user_obj.password = hashed_password
        db.session.commit()
        logout_user()
        flash('비밀번호가 변경되었어요. . .')
        return redirect(url_for('accounts.login'))

    else:
        flash_form_errors(form)
    return render_template('accounts/resetting/password_update.html', user=user_obj, form=form)


@accounts_bp.route('forget/password', methods=['GET', 'POST'])
def forget_password_email():
    form = AccountsUpdateForm()
    email = form.email.data
    user_obj = User.query.filter_by(email=email).first()

    if form.validate_on_submit():
        if user_obj:
            # if user_obj.is_verified:
            from flask_www.configs import safe_time_serializer
            password_token = safe_time_serializer.dumps(email, salt='email-confirm')
            user_obj.password_token = password_token
            db.session.commit()

            add_if = "forget_password"
            subject = "β-0.0.2 비밀번호 변경 메일"
            msg_txt = 'accounts/send_mails/mail.txt'
            msg_html = 'accounts/send_mails/accounts_mail.html'
            send_mail_for_any(subject, user_obj, email, password_token, msg_txt, msg_html, add_if)
            # send_mail_for_password_verification(email, password_token)
            flash('이메일을 전송하였습니다. 메일을 확인하세요')
            return redirect(url_for('accounts.token_send', email=email))
        else:
            flash('등록된 이메일이 없어요!')
            return redirect(url_for('accounts.register', form=AccountsForm()))
    return render_template('accounts/resetting/forget_pw_email.html', user_obj=user_obj, form=form)


@accounts_bp.route('/pwforget/update/<int:_id>/<password_token>', methods=['GET', 'POST'])
def forget_password_update(_id, password_token):
    form = PasswordUpdateForm()
    user_obj = User.query.get_or_404(_id)
    password_reg = "^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{9,30}$"
    regex = re.compile(password_reg)
    password_reg_mat = re.search(regex, str(form.password.data))
    try:
        if session['password_token']:
            if form.validate_on_submit():
                if not password_reg_mat:
                    flash('비밀번호는 알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상이어야 합니다.')
                    return redirect(request.path)
                hashed_password = security.generate_password_hash(form.password.data)
                user_obj.password = hashed_password
                user_obj.password_token = password_token
                db.session.commit()
                if user_obj.is_verified:
                    return redirect(url_for('accounts.login'))
                else:
                    # 인증하지 않은 경우 비번을 잊어먹어서, 다시 비번 재설정메일을 보내면
                    # 비번 재설정이 되면서 가입인증메일이 날라가도록 한다.
                    email = user_obj.email
                    from flask_www.configs import safe_time_serializer
                    auth_token = safe_time_serializer.dumps(email, salt='email-confirm')
                    add_if = "not_verified"
                    subject = "β-0.4 비번재설정후 가입인증 메일"
                    msg_txt = 'accounts/send_mails/mail.txt'
                    msg_html = 'accounts/send_mails/accounts_mail.html'
                    send_mail_for_any(subject, user_obj, email, auth_token, msg_txt, msg_html, add_if)
                    return redirect(url_for('accounts.token_send', email=email))  # 이렇게 token_send로 이메일을 넘겨 줄수도 있다.
            else:
                flash_form_errors(form)
        else:
            print('444444444444444444444444')
            message = '잘못된 접근입니다 . . .'
            # flash('잘못된 접근입니다 . . .')
            return redirect(url_for('accounts.athentication_error', message=message))
    except Exception as e:
        print(e)
        message = '무작정 들어온.... 잘못된 접근입니다 . . .'
        return redirect(url_for('accounts.athentication_error', message=message))
    return render_template('accounts/resetting/forget_pw_update.html', user=user_obj, form=form)


# @accounts_bp.route('/delete/ajax/<_id>', methods=['POST'])#
# @account_ownership_required
# def delete_ajax(_id):
@accounts_bp.route('/delete/ajax', methods=['POST'])
def delete_ajax():
    _id = request.form.get("_id")
    target_user = db.session.query(User).filter_by(id=_id).first()
    target_profile = db.session.query(Profile).filter_by(user_id=_id).first()
    if request.method == 'POST':
        if target_profile and ((current_user.id == target_user.id) or current_user.is_admin):
            profile_delete(target_profile)
        db.session.delete(target_user)

        shopcategory_objs = db.session.query(ShopCategory).filter_by(user_id=_id).all()
        if shopcategory_objs:
            shop_disable_save(shopcategory_objs)

        product_objs = db.session.query(Product).filter_by(user_id=_id).all()
        if product_objs:
            product_disable_save(product_objs)

        db.session.commit()
        if not current_user.is_authenticated:#current_user.id == target_user.id:
            data_response = {
                "redirect_url": url_for('commons.index')
            }
            return make_response(jsonify(data_response))
        if current_user.is_authenticated and current_user.is_admin:
            data_response = {
                "redirect_url":url_for('admin_accounts._list')
            }
            return make_response(jsonify(data_response))
    abort(401)


@accounts_bp.route('accounts/error')
def athentication_error():
    return render_template('accounts/users/etc/error.html')
