from sqlalchemy import func

from flask_www.configs import db


class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime(), server_default=func.now())
    updated_at = db.Column(db.DateTime(), server_default=func.now(), onupdate=func.now())


class VarRatio(BaseModel):
    __tablename__ = 'var_ratios'
    title = db.Column(db.String(100), nullable=False)
    ratio = db.Column(db.Numeric(10, 4))


class BaseAmount(BaseModel):
    __tablename__ = 'base_amounts'
    title = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Integer, default="")
