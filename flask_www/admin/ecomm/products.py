from flask import Blueprint

NAME = 'admin_products'
admin_products_bp = Blueprint(NAME, __name__, url_prefix='/admin/products')
