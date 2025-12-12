from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Portfolio(Base):
    __tablename__ = 'portfolios'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(100), nullable=False, index=True)
    wallet_address = Column(String(200), nullable=False)
    label = Column(String(100))
    balance = Column(Float, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f'<Portfolio {self.wallet_address}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'wallet_address': self.wallet_address,
            'label': self.label,
            'balance': self.balance,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }


class WhaleAlert(Base):
    __tablename__ = 'whale_alerts'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(100), nullable=False, index=True)
    alert_type = Column(String(50))  # SMS, EMAIL, TELEGRAM
    threshold = Column(Float, default=1000000)  # Alert when transaction > this amount
    is_enabled = Column(Boolean, default=True)
    contact_info = Column(String(200))  # Email, phone, telegram username
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<WhaleAlert {self.user_id} - {self.alert_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'alert_type': self.alert_type,
            'threshold': self.threshold,
            'is_enabled': self.is_enabled,
            'contact_info': self.contact_info,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserPreference(Base):
    __tablename__ = 'user_preferences'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(100), unique=True, nullable=False, index=True)
    theme = Column(String(20), default='dark')
    currency = Column(String(10), default='USD')
    notifications_enabled = Column(Boolean, default=True)
    default_timeframe = Column(String(10), default='1D')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserPreference {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'theme': self.theme,
            'currency': self.currency,
            'notifications_enabled': self.notifications_enabled,
            'default_timeframe': self.default_timeframe,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
