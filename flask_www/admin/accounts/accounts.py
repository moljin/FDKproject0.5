from flask import Blueprint, render_template, redirect, url_for, abort, flash, session, request
from flask_login import current_user, login_user, logout_user
from itsdangerous import SignatureExpired
from sqlalchemy import desc
from werkzeug import security

from flask_www.accounts.forms import LoginForm, AccountsForm
from flask_www.accounts.models import User
from flask_www.accounts.utils import login_required, admin_required, optimal_password_check, existing_email_check
from flask_www.admin.accounts.forms import AuthPermitForm
from flask_www.admin.accounts.utils import admin_user_save, admin_send_mail, is_admin_staff_true_save, is_admin_true_save, is_staff_true_save, is_admin_staff_false_save, is_admin_false_save, \
    is_staff_false_save
from flask_www.commons.utils import flash_form_errors
from flask_www.configs import db
from flask_www.configs.config import SUPER_ADMIN_EMAIL

NAME = 'admin_accounts'
admin_accounts_bp = Blueprint(NAME, __name__, url_prefix='/admin')


@admin_accounts_bp.route('/', methods=['GET'])  # /admin 로 진입하면 admin 로그인 페이지로 보낸다.
def index():
    try:
        user_id = current_user.id
        user = User.query.filter_by(id=user_id).one()
    except Exception as e:
        print("/admin approach :: ", e)
        user = None
    if current_user.is_authenticated and user.is_admin:
        return render_template('admin/admin_index.html')
    else:
        return redirect(url_for('admin_accounts.login', user=user))


@admin_accounts_bp.route('auth/permission/request/<email>', methods=['GET', 'POST'])
@login_required
def auth_permit_request(email):
    form = AuthPermitForm()
    user_obj = User.query.filter_by(email=email).first()
    print(request.form.get("email"))
    if request.method == 'POST' and email == request.form.get("email"):
        is_staff = request.form.get("is_staff")
        is_admin = request.form.get("is_admin")
        admin = request.form.get("admin")  # 관리자가 본인 관리자 권한 해제 요청시
        from flask_www.configs import safe_time_serializer
        admin_token = safe_time_serializer.dumps(email, salt='email-confirm')
        user_obj.admin_token = admin_token
        db.session.add(user_obj)
        db.session.commit()

        if not admin:  # 비관리자 회원이 관리자 혹은 스태프 권한 요청시
            add_if = "auth_permission"
        else:  # 관리자가 본인 관리자 권한 해제 요청시
            add_if = "not_admin"
        subject = "β-0.4 관리자 인증용 메일"
        authorizer_email = SUPER_ADMIN_EMAIL
        req_email = email  # 관리자로 승인을 요청한 회원의 메일이다.
        msg_txt = 'accounts/send_mails/mail.txt'
        msg_html = 'admin/accounts/send_mails/auth_permission_mail.html'
        """auth_permit 을 신청한 회원 이메일을 send_mail 에 딸려 보내야 하는데...."""
        # send_mail_for_any(subject, authorizer_email, admin_token, msg_txt, msg_html, add_if)
        if is_staff == "y":
            is_staff = "y"
        else:
            is_staff = "n"

        if is_admin == "y":
            is_admin = "y"
        else:
            is_admin = "n"
        admin_send_mail(subject, authorizer_email, admin_token, msg_txt, msg_html, add_if, req_email, is_staff, is_admin)
        return redirect(url_for('accounts.token_send', email=email))  # 이렇게 token_send로 이메일을 넘겨 줄수도 있다.
    if user_obj and current_user.is_authenticated:
        print("current_user.is_admin", current_user.is_admin)
        # 로그인한 이메일 입력(이걸 서버에 저장해야 되나? 저장하지 않는 방법은?)
        # 저장하지 않고 그냥 html 에 id=email span tag 에 넣어서 보낸다.
        # 관리자에게 관리자로 인증요청 메일발송(일단 몰진네이버메일(moljin@naver.com) 사용): send_mail_for_any
        # 메일 수신한 관리자가 인증 클릭하면 서버에 저장된 가입이메일인지 체크: permit_confirm
        # 이메일 존재 체크완료되면 관리자 is_admin=True 로 저장되면서 인증완료: permit_confirm
        if (email == current_user.email) and current_user.is_admin:
            return render_template('admin/accounts/auth.html', target_user=user_obj, form=form, admin="관리자 자신")
        if email == current_user.email and not current_user.is_admin:
            return render_template('admin/accounts/auth.html', target_user=user_obj, form=form)
        else:
            abort(401)


@admin_accounts_bp.route('auth/permission/confirm/<add_if>/<token>')
def auth_confirm_email(add_if, token):
    from flask_www.configs import safe_time_serializer
    email = safe_time_serializer.loads(token, salt='email-confirm', max_age=86400)  # 24시간 cf. 60 == 60초 즉, 1분
    try:
        user_obj = User.query.filter_by(email=email).first()
        is_staff = request.args.get("is_staff")
        is_admin = request.args.get("is_admin")
        if (is_admin == "y") and (is_staff == "y"):
            if user_obj and user_obj.is_admin and user_obj.is_staff and (add_if == "auth_permission"):
                flash('관리자와 스태프 권한 인증이 이미 되어 있어요!')
            if user_obj and user_obj.is_admin and not user_obj.is_staff and (add_if == "auth_permission"):
                is_staff_true_save(user_obj)
                flash('관리자 권한 인증은 이미 되어 있었고, 스태프 권한 인증은 완료되었습니다.')
            if user_obj and not user_obj.is_admin and user_obj.is_staff and (add_if == "auth_permission"):
                is_admin_true_save(user_obj)
                flash('스태프 권한 인증은 이미 되어 있었고, 관리자 권한 인증은 완료되었습니다.')
            if user_obj and not user_obj.is_admin and not user_obj.is_staff and (add_if == "auth_permission"):
                is_admin_staff_true_save(user_obj)
                flash('관리자와 스태프 권한 인증이 완료되었습니다.')
            return redirect(url_for('admin_accounts.index'))
        if (is_admin == "n") and (is_staff == "n"):
            if user_obj and user_obj.is_admin and user_obj.is_staff and ((add_if == "auth_permission") or (add_if == "not_admin")):
                is_admin_staff_false_save(user_obj)
            if user_obj and user_obj.is_admin and not user_obj.is_staff and ((add_if == "auth_permission") or (add_if == "not_admin")):
                is_admin_false_save(user_obj)
            if user_obj and not user_obj.is_admin and user_obj.is_staff and ((add_if == "auth_permission") or (add_if == "not_admin")):
                is_staff_false_save(user_obj)
            flash(f'권한해제가 완료되어, {user_obj.email}님은 관리자와 스태프 권한 모두 없습니다.')
        if (is_admin == "y" or "n") or (is_staff == "y" or "n"):
            if (is_admin == "y") and (is_staff == "n"):
                if user_obj and user_obj.is_admin and (add_if == "auth_permission"):
                    flash('관리자 권한 인증은 이미 되어 있어요!')
                if user_obj and not user_obj.is_admin and (add_if == "auth_permission"):
                    is_admin_true_save(user_obj)
                    flash('관리자 권한 인증이 완료되었습니다.')
                if user_obj and user_obj.is_staff and (add_if == "auth_permission"):
                    is_staff_false_save(user_obj)
                return redirect(url_for('admin_accounts.index'))
            if (is_admin == "n") and (is_staff == "y"):
                if user_obj and user_obj.is_staff and ((add_if == "auth_permission") or (add_if == "not_admin")):
                    flash('스태프 권한 인증이 이미 되어 있어요!')
                if user_obj and not user_obj.is_staff and ((add_if == "auth_permission") or (add_if == "not_admin")):
                    is_staff_true_save(user_obj)
                    flash('스태프 권한 인증이 완료되었습니다.')
                if user_obj and user_obj.is_admin and ((add_if == "auth_permission") or (add_if == "not_admin")):
                    is_admin_false_save(user_obj)
                # 스태프 인증되면 리다이렉트 할 페이지 == 스태프들만 보는 index page
                return redirect(url_for('admin_accounts.index'))
            return redirect(url_for('commons.index'))  # 스태프도 어드민도 아닌 경우 리디렉트 page
        elif not (is_admin == "y" or "n") or not (is_staff == "y" or "n"):
            flash('가입한 내용이 없거나 . . . 문제가 발생했습니다.')
            return redirect(url_for('commons.index'))
    except SignatureExpired:
        flash('토큰이 죽었어요...!')
        # confirm_expired_msg = '토큰이 죽었어요...!'
        # return confirm_expired_msg
    # 가입도 안된 토큰으로 시도할 때 flash를 안고 돌아간다.... #'<h1>토큰이 살아 있어요....</h1>'  # True 로 바꿔주고, 링크를 클릭하면 인증완료된다.
    return redirect(url_for('admin_accounts.auth_permit_request', email=email))


@admin_accounts_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if current_user.is_authenticated and current_user.is_admin:
        flash("로그인 상태입니다!")
        return redirect(url_for("admin_accounts.index"))
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.is_verified and user.is_admin:
            if security.check_password_hash(user.password, form.password.data):
                login_user(user)
                session['email'] = user.email  # 추가
                return redirect(url_for("admin_accounts.index"))
            else:
                flash("비밀번호를 확인하세요 . . . ")
        abort(401)
    else:
        flash_form_errors(form)
    return render_template('admin/accounts/login.html', form=form)


@admin_accounts_bp.route('/logout', methods=['GET', 'POST'])
@admin_required
def logout():
    session.pop('email', None)
    logout_user()
    return redirect(url_for('admin_accounts.login'))


@admin_accounts_bp.route('/accounts/list', methods=['GET'])
@admin_required
def _list():
    form = AccountsForm()
    user_objs = User.query.order_by(desc(User.id))  # .all()
    page = request.args.get('page', type=int, default=1)
    pagination = user_objs.paginate(page, per_page=5, error_out=False)
    user_list = pagination.items
    return render_template('admin/accounts/list.html',
                           form=form,
                           # users=user_objs,
                           users=user_list,
                           pagination=pagination)


@admin_accounts_bp.route('/accounts/<int:_id>/change', methods=['GET'])
@admin_required
def change(_id):
    form = AccountsForm()
    user_obj = User.query.filter_by(id=_id).first()
    return render_template('admin/accounts/change.html', form=form, target_user=user_obj)


@admin_accounts_bp.route('/accounts/create', methods=['GET'])
@admin_required
def create():
    form = AccountsForm()
    return render_template('admin/accounts/create.html', form=form)


@admin_accounts_bp.route('/accounts/save', methods=['POST'])
@admin_required
def save():
    if request.method == 'POST':
        target_user_id = request.form.get("_id")
        req_email = request.form.get("email")
        password = request.form.get("password")
        repassword = request.form.get("repassword")
        auth_token = request.form.get("auth_token")
        password_token = request.form.get("password_token")
        admin_token = request.form.get("admin_token")
        is_verified = request.form.get("is_verified")
        is_staff = request.form.get("is_staff")
        is_admin = request.form.get("is_admin")
        print("is_verified is_verified", is_verified)
        print("is_staff is_staff", is_staff)
        print("is_admin is_admin", is_admin)
        if target_user_id:
            target_user = User.query.get_or_404(target_user_id)
            if is_admin is None:  # 관리자 자신이 관리자 권한 해제 요청을 진행하는 경우
                if target_user.is_admin and current_user == target_user:
                    flash("관리자님의 관리자 권한 해제는 SUPER ADMIN만 가능합니다..")
                    return redirect(url_for("admin_accounts.auth_permit_request", email=current_user.email, is_admin="관리자 자신"))
                    # 관리자 자신은 is_admin 이외의 것은 수정할 수 있지만,
                    # is_admin 해제는 최고 관리자에게 메일 요청으로 할 수 있도록 한다.
            if target_user.email != req_email:
                if existing_email_check(req_email) == "Existing":
                    flash("가입된 이메일이 존재합니다.")
                    return redirect(request.referrer)
            target_user.email = req_email

            if password or repassword:
                if optimal_password_check(password) == "No Password":
                    flash('비밀번호(알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상)가 입력되지 않았습니다.')
                    return redirect(request.referrer)
                if password and not repassword:
                    flash("비밀번호 확인 입력란을 채워주세요!")
                    return redirect(request.referrer)
                if (password == repassword) and (optimal_password_check(password) == "Optimal"):
                    hashed_password = security.generate_password_hash(password)
                    target_user.password = hashed_password
                    admin_user_save(target_user, auth_token, password_token, admin_token, is_verified, is_staff, is_admin)
                    return redirect(url_for("admin_accounts.change", _id=target_user_id))
                if (password == repassword) and (optimal_password_check(password) == "Not Optimal"):
                    flash('비밀번호는 알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상이어야 합니다.')
                    return redirect(request.referrer)
                else:
                    flash("비밀번호가 일치하지 않아요")
                    return redirect(request.referrer)
            else:
                admin_user_save(target_user, auth_token, password_token, admin_token, is_verified, is_staff, is_admin)
        else:
            if existing_email_check(req_email) == "Existing":
                flash("가입된 이메일이 존재합니다.")
                return redirect(request.referrer)
            if (password == repassword) and (optimal_password_check(password) == "Optimal"):
                hashed_password = security.generate_password_hash(password)
                new_user = User(email=req_email, password=hashed_password)
                admin_user_save(new_user, auth_token, password_token, admin_token, is_verified, is_staff, is_admin)
                return redirect(url_for("admin_accounts._list"))
            if (password == repassword) and (optimal_password_check(password) == "Not Optimal"):
                flash('비밀번호는 알파벳, 특수문자와 숫자를 모두 포함한 9자리 이상이어야 합니다.')
                return redirect(request.referrer)
            else:
                flash("비밀번호가 일치하지 않아요")
                return redirect(request.referrer)
        return redirect(url_for("admin_accounts.change", _id=target_user_id))
    else:
        abort(404)
