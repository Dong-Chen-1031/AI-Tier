from typing import Optional

from db.db import SessionLocal
from db.models.user import User
from sqlalchemy import or_, select
from sqlalchemy.orm import Session


class UserDB:
    """User 邏輯層"""

    def __init__(self): ...

    def __enter__(self):
        self.db = SessionLocal().__enter__()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        return self.db.__exit__(exc_type, exc_value, traceback)

    def _create(self, user: User) -> User:
        """新增用戶"""
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        """更新用戶（需先從資料庫取得實體）"""
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all(self) -> list[User]:
        """取得所有用戶"""
        stmt = select(User)
        return list(self.db.execute(stmt).scalars().all())

    def get_or_create_user(
        self,
        email: str,
        name: str,
        dc_id: int,
        dc_user_name: str,
        avatar_url: str | None = None,
        role: str = "user",
    ) -> tuple[User, bool]:
        """
        取得或創建用戶
        Returns: (user, created) - created 為 True 表示新建，False 表示已存在
        """
        db: Session = self.db
        stmt = select(User).where(User.email == email)
        user = db.execute(stmt).scalar_one_or_none()

        if user:
            # 用戶已存在，更新資訊
            user.name = name
            user.dc_id = dc_id
            user.dc_user_name = dc_user_name
            user.role = role
            if avatar_url:
                user.avatar_url = avatar_url
            # 確保 mail_hash 存在（為舊數據補全）
            if not user.mail_hash:
                user.mail_hash = User.generate_mail_hash(email)
            self.update(user)
            return user, False

        # 創建新用戶
        user = User(
            email=email,
            name=name,
            dc_id=dc_id,
            dc_user_name=dc_user_name,
            role=role,
            avatar_url=avatar_url,
        )
        self._create(user)
        return user, True

    def get_by_pelican_id(self, pelican_id: int) -> Optional[User]:
        """根據 pelican_id 查詢用戶"""
        return self.get_user(pelican_id=pelican_id)

    def get_by_email(self, email: str) -> Optional[User]:
        """根據 email 查詢用戶"""
        return self.get_user(email=email)

    def get_by_mail_hash(self, mail_hash: str) -> Optional[User]:
        """根據 mail_hash 查詢用戶"""
        return self.get_user(email_hash=mail_hash)

    def get_user(
        self,
        *,
        dc_id: Optional[int] = None,
        email: Optional[str] = None,
        email_hash: Optional[str] = None,
        pelican_id: Optional[int] = None,
    ) -> Optional[User]:
        """根據 dc_id 或 email 或 pelican_id 查詢用戶"""
        conditions = []
        if dc_id is not None:
            conditions.append(User.dc_id == dc_id)
        if email is not None:
            conditions.append(User.email == email)
        if pelican_id is not None:
            conditions.append(User.pelican_id == pelican_id)
        if email_hash is not None:
            conditions.append(User.mail_hash == email_hash)

        if not conditions:
            return None

        stmt = select(User).where(or_(*conditions))
        return self.db.execute(stmt).scalar_one_or_none()

    def update_pelican_id(self, email: str, pelican_id: int) -> Optional[User]:
        """更新用戶的 pelican_id"""
        user = self.get_by_email(email)
        if not user:
            return None
        user.pelican_id = pelican_id
        self.update(user)
        return user
