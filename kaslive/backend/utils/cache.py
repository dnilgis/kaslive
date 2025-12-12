"""
Cache utility functions for KASLIVE v2.0
"""

import functools
import json
from typing import Any, Callable, Optional
import redis
from backend.config import Config
import logging

logger = logging.getLogger(__name__)


class CacheManager:
    """Redis cache manager"""
    
    def __init__(self):
        self.redis_client = redis.from_url(
            Config.REDIS_URL,
            decode_responses=True
        )
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = self.redis_client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Cache get error: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL"""
        try:
            serialized = json.dumps(value)
            return self.redis_client.setex(key, ttl, serialized)
        except Exception as e:
            logger.error(f"Cache set error: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            return self.redis_client.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error: {str(e)}")
            return False
    
    def clear(self, pattern: str = "*") -> bool:
        """Clear cache by pattern"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return True
        except Exception as e:
            logger.error(f"Cache clear error: {str(e)}")
            return False


# Global cache instance
cache_manager = CacheManager()


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Usage:
        @cached(ttl=600, key_prefix="price")
        def get_price():
            return fetch_price_from_api()
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}"
            if args:
                cache_key += f":{':'.join(str(arg) for arg in args)}"
            if kwargs:
                cache_key += f":{':'.join(f'{k}={v}' for k, v in sorted(kwargs.items()))}"
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_result
            
            # Call function and cache result
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            logger.debug(f"Cache miss, stored: {cache_key}")
            
            return result
        
        return wrapper
    return decorator
