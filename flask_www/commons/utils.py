import os
import re
import shutil
import unicodedata
import uuid

from flask import g, abort, flash, session

from flask_www.configs import db
from flask_www.configs.config import NOW, BASE_DIR


def flash_form_errors(form):
    for _, errors in form.errors.items():
        for e in errors:
            flash(e)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'jpg', 'jpeg', 'png', 'gif'}


def random_word(length):  # 같은 이름의 파일을 다른 이름으로 랜덤하게 만든다.
    import random, string
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))


def filename_format(now, filename):
    return "{random_word}-{user_id}-{username}-{date}-{microsecond}{extension}".format(
        random_word=random_word(20),
        user_id=str(g.user.id),
        username=g.user.email.split('@')[0],
        date=str(now.date()),
        microsecond=now.microsecond,
        extension=os.path.splitext(filename)[1],
    )


def base_file_path(filename, request_path, user):
    # admin에서 저장하는 이미지들을 동일한 디렉토리에 저장하기 위해 request_path 를 임의로 동일하게 정해서 따로 받기로 했다.
    base_relative_path = "static/media/user_images/{request_path}/{year}/{month}/{day}/{user_id}/{username}/{random_word}/{filename}".format(
        request_path=request_path,#request.path.split('/')[2],
        year=NOW.year,
        month=NOW.month,
        day=NOW.day,
        user_id=user.id,
        username=user.email.split('@')[0],
        random_word=random_word(20),
        filename=filename_format(NOW, filename),
    )
    return base_relative_path


def save_file(now, file, request_path, user):
    if file.filename == '':
        abort(400)
    if file and allowed_file(file.filename):
        filename = filename_format(now, file.filename)
        relative_path = base_file_path(filename, request_path, user)
        upload_path = os.path.join(BASE_DIR, relative_path)
        os.makedirs(os.path.dirname(upload_path), exist_ok=True)
        file.save(upload_path)
        return relative_path, upload_path   # 템플릿단에서는 relative_path가 사용된다. static 폴더가 있어야 찾아간다.
    else:
        abort(400)


def existing_img_and_dir_delete_without_update(existing_img_path):
    old_image_path = os.path.join(BASE_DIR, existing_img_path)
    if os.path.isfile(old_image_path):
        shutil.rmtree(os.path.dirname(old_image_path))


def existing_img_and_dir_delete_for_update(existing_img_path, req_img, request_path, user):
    if req_img:
        relative_path, upload_path = save_file(NOW, req_img, request_path, user)
        old_image_abs_path = os.path.join(BASE_DIR, existing_img_path)
        if old_image_abs_path != upload_path:
            if os.path.isfile(old_image_abs_path):
                shutil.rmtree(os.path.dirname(old_image_abs_path))
        return relative_path


def c_slugify(value, allow_unicode=False):
    """Django 에서 가져옴(def slugify)"""
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')


def current_db_session_add(obj):
    current_db_sessions = db.session.object_session(obj)
    current_db_sessions.add(obj)


def current_db_session_delete(obj):
    current_db_sessions = db.session.object_session(obj)
    current_db_sessions.delete(obj)


def base64_to_file(img_string, file_name, path, user):
    import base64
    from PIL import Image
    import io
    img_data = base64.b64decode(img_string)
    image_path = base_file_path(file_name, path, user)
    upload_path = os.path.join(BASE_DIR, image_path)
    os.makedirs(os.path.dirname(upload_path), exist_ok=True)

    img = Image.open(io.BytesIO(img_data))
    # img.save(image_path) ## flask_www 폴더를 만들면 먼가 아구가 안맞아서 이미지가 저장이 안되는 군.... flask_www 폴더가 없으면 v0.0.3에서 처럼... 저장된다.
    img.save(upload_path)

    return image_path, file_name  # filename


def file_to_base64(file_path, file_name):
    import base64
    _format = file_name.split('.')[1]
    with open(file_path, "rb") as image_file:
        base64_string = base64.b64encode(image_file.read()).decode('utf-8')
        base64_src = "data:image/" + _format + ";base64," + base64_string

    return base64_src, file_name


def file_to_base64_src(file_path, file_name):
    import base64
    _format = file_name.split('.')[1]
    with open(file_path, "rb") as image_file:
        base64_string = base64.b64encode(image_file.read()).decode('utf-8')
        base64_src = "data:image/" + _format + ";base64," + base64_string

    return base64_src


def ajax_post_key():
    if 'ajax_post_key' in session:
        session['ajax_post_key'] = session.get('ajax_post_key')
    else:
        session["ajax_post_key"] = str(uuid.uuid4())
    return session['ajax_post_key']


def new_three_image_save(user, new_obj, image1, image2, image3, path):
    if image1:
        relative_path1, _ = save_file(NOW, image1, path, user)
        new_obj.image_1_path = relative_path1
    if image2:
        relative_path2, _ = save_file(NOW, image2, path, user)
        new_obj.image_2_path = relative_path2
    if image3:
        relative_path3, _ = save_file(NOW, image3, path, user)
        new_obj.image_3_path = relative_path3


def existing_cover_image_save(existing_img_obj, image1, image2, image3, path, user):
    if image1:
        if existing_img_obj.image_1_path is not None:
            existing_img_obj.image_1_path = existing_img_and_dir_delete_for_update(existing_img_obj.image_1_path, image1, path, user)
        else:
            relative_path1, _ = save_file(NOW, image1, path, user)
            existing_img_obj.image_1_path = relative_path1
    if image2:
        if existing_img_obj.image_2_path is not None:
            existing_img_obj.image_2_path = existing_img_and_dir_delete_for_update(existing_img_obj.image_2_path, image2, path, user)
        else:
            relative_path2, _ = save_file(NOW, image2, path, user)
            existing_img_obj.image_2_path = relative_path2
    if image3:
        if existing_img_obj.image_3_path is not None:
            existing_img_obj.image_3_path = existing_img_and_dir_delete_for_update(existing_img_obj.image_3_path, image3, path, user)
        else:
            relative_path3, _ = save_file(NOW, image3, path, user)
            existing_img_obj.image_3_path = relative_path3


def elapsed_day(updated_at):
    from datetime import datetime
    from pytz import timezone
    # print("datetime.now(timezone('Asia/Seoul')).today()", datetime.now(timezone('Asia/Seoul')).today())
    # print("NOW", NOW)
    # print("updated_at", updated_at)
    diff_time = NOW - updated_at
    # print("diff_time", diff_time)
    # diff_time_seconds = diff_time/86400
    # print("diff_time.days", diff_time.days)
    # print("diff_time 몇 시간 지난 건지", diff_time.seconds / 60 / 60)
    # print(f'{diff_time.days}일 {int(diff_time.seconds / 60 / 60)}시간 {int(diff_time.seconds / 60 - (int(diff_time.seconds / 60 / 60)) * 60)}분 지났어요')
    # print("diff_time_seconds = diff_time/86400(24시간) 머지", diff_time/86400)
    timestamp_now = datetime.now().timestamp()  # 타임스탬프(단위:초)
    # print("datetime.now()", datetime.now())
    # print("timestamp_now", timestamp_now)
    return diff_time.days
