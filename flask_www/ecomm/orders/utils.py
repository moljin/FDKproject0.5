import hashlib

from flask import g
from flask_login import current_user

from flask_www.commons.utils import random_word
from flask_www.configs import db
from flask_www.configs.config import NOW
from flask_www.ecomm.orders.iamport import payments_prepare, find_transaction
from flask_www.ecomm.orders.models import Order, OrderTransaction, CustomerUid
from flask_www.ecomm.products.models import Product, ProductOption

prod = ''
option = ''


def order_transaction_create(order_id, amount, success=None, transaction_status=None):
    if not order_id:
        raise ValueError("주문 정보 오류")
    order = Order.query.filter_by(id=order_id).first()
    order_hash = hashlib.sha1(str(order_id).encode('utf-8')).hexdigest()
    email_hash = str(order.email).split("@")[0]
    final_hash = hashlib.sha1((order_hash + email_hash).encode('utf-8')).hexdigest()[:20]+random_word(10)
    merchant_order_id = str(final_hash)
    print('저기2 ++++++++++++++++++++++ merchant_order_id', merchant_order_id)
    print('class OrderTransactionManager(models.Manager) 시작하고 payments_prepare 호출')

    payments_prepare(merchant_order_id, amount)

    transaction = OrderTransaction(
        order_id=order_id,
        merchant_order_id=merchant_order_id,
        amount=amount
    )
    print('99999999999999999999999==success', success, transaction.order_id)
    if success is not None:
        transaction.is_success = success
        transaction.transaction_status = transaction_status
        print('00000000000000000000')

    try:
        db.session.add(transaction)
        db.session.commit()
    except Exception as e:
        print('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
        print("save error", e)
    return transaction.merchant_order_id


def product_stock_update(order_products):
    global prod
    for order_product in order_products:
        prod = Product.query.filter_by(id=order_product.product_id).one()
        prod.stock -= order_product.pd_subtotal_quantity

    db.session.bulk_save_objects([prod])
    db.session.commit()


def product_option_stock_update(order_products, order_options):
    global option
    product_stock_update(order_products)

    for order_option in order_options:
        option = ProductOption.query.get(order_option.option_id)
        option.stock -= order_option.op_quantity
    db.session.bulk_save_objects([option])
    db.session.commit()


# get_transaction--find_transaction--order_payment_validation 통합 (
def iamport_client_validation(merchant_id, order_id):
    """get_transaction--find_transaction 을 거치면서 아임포트와 통신해서
    imp_id를 받아내 local_transaction 을 찾아 확인하는 validation 한다."""
    order_trans_obj = OrderTransaction.query.filter_by(merchant_order_id=merchant_id, order_id=order_id).first()
    print('00000000000000000000000000000000000', order_trans_obj)
    if order_trans_obj.transaction_id:
        print('def order_payment_validation:::instance.merchant_order_id', order_trans_obj.merchant_order_id)
        iamport_transaction = get_transaction(order_trans_obj.merchant_order_id)
        merchant_order_id = iamport_transaction['merchant_order_id']
        print('def order_payment_validation:::merchant_order_id:::', merchant_order_id)
        imp_id = iamport_transaction['imp_id']
        amount = iamport_transaction['amount']
        print('def order_payment_validation')
        # local_transaction = OrderTransaction.query.filter_by(merchant_order_id=merchant_order_id,
        #                                                      transaction_id=imp_id,
        #                                                      amount=amount).exists() # 이거는 작동안한다. True 를 반환하려면 scalar
        local_transaction = db.session.query(db.exists().where(OrderTransaction.merchant_order_id == merchant_order_id,
                                                               OrderTransaction.transaction_id == imp_id,
                                                               OrderTransaction.amount == amount)).scalar()
        print('local_transaction : True', local_transaction)
        if not iamport_transaction or not local_transaction:
            raise ValueError("비정상 거래입니다.")


def get_transaction(merchant_order_id):
    print("get_transaction 시작:::merchant_order_id", merchant_order_id)
    result = find_transaction(merchant_order_id)
    print("get_transaction 시작하고 find_transaction호춮")
    print('000000000000000000000000000=get_transaction=result', result)
    if result['status'] == 'paid':
        return result
    else:
        return None


def customer_uid_set(cart_id):
    user_id = str(g.user.id)
    username = g.user.email.split('@')[0]
    random_string = random_word(7)

    # customer_uid = username + "&_100" + user_id + "_%$" + random_string + "?" + str(NOW.microsecond)
    customer_uid = username + "_100" + user_id + "_100" + str(cart_id)
    new_customer_uid_obj = CustomerUid(user_id=user_id, customer_uid=customer_uid)
    db.session.add(new_customer_uid_obj)
    db.session.commit()
    return customer_uid


def check_customer_uid(req_card_number, expiry, req_customer_uid):
    customer_uid_obj = CustomerUid.query.filter_by(user_id=current_user.id,
                                                   card_number=req_card_number,
                                                   customer_uid=req_customer_uid).first()
    if customer_uid_obj:
        customer_uid = customer_uid_obj.customer_uid
        return customer_uid
    else:
        new_customer_uid_obj = CustomerUid(user_id=current_user.id,
                                           card_number=req_card_number,
                                           card_expiry=expiry,
                                           customer_uid=req_customer_uid)
        db.session.add(new_customer_uid_obj)
        db.session.commit()
        customer_uid = new_customer_uid_obj.customer_uid
        return customer_uid

