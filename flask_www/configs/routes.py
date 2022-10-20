def routes_init(app):
    from flask_www.admin.accounts import accounts, profiles
    app.register_blueprint(accounts.admin_accounts_bp)
    app.register_blueprint(profiles.admin_profiles_bp)

    from flask_www.admin.ecomm import shops, products
    app.register_blueprint(shops.admin_shops_bp)
    app.register_blueprint(products.admin_products_bp)

    from flask_www.commons import common
    app.register_blueprint(common.common_bp)

    from flask_www.accounts import accounts, profiles
    app.register_blueprint(accounts.accounts_bp)
    app.register_blueprint(profiles.profiles_bp)

    from flask_www.ecomm.products import products
    app.register_blueprint(products.products_bp)

    from flask_www.ecomm.carts import carts
    app.register_blueprint(carts.carts_bp)

    from flask_www.ecomm.promotions import coupons, points
    app.register_blueprint(coupons.coupons_bp)
    app.register_blueprint(points.points_bp)

    from flask_www.ecomm.orders import orders
    app.register_blueprint(orders.orders_bp)

    from flask_www.lotto import lotto
    app.register_blueprint(lotto.lotto_bp)



