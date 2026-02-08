import hashlib
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.db import Base

if TYPE_CHECKING:
    from db.models.server import Server


class User(Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    dc_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    mail_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
    )  # 使用 SHA-256 生成的郵箱哈希
    dc_user_name: Mapped[str | None] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="user")
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    pelican_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    # 建立與 Server 的反向關聯
    servers: Mapped[list["Server"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    def __init__(self, **kwargs):
        """初始化用戶，自動生成 mail_hash"""
        if "mail_hash" not in kwargs and "email" in kwargs:
            kwargs["mail_hash"] = self.generate_mail_hash(kwargs["email"])
        super().__init__(**kwargs)

    @staticmethod
    def generate_mail_hash(email: str) -> str:
        """從 email 生成 SHA-256 哈希"""
        return hashlib.sha256(email.lower().encode("utf-8")).hexdigest()

    def __repr__(self):
        return f"<User(email={self.email}, name={self.name}, role={self.role})>"

    @property
    def server_count(self) -> int:
        """返回該用戶擁有的伺服器數量"""
        return len(self.servers)

    def to_dict(self) -> dict:
        """將 User 對象轉換為字典格式"""
        return {
            "email": self.email,
            "name": self.name,
            "dc_id": self.dc_id,
            "mail_hash": self.mail_hash,
            "dc_user_name": self.dc_user_name,
            "role": self.role,
            "avatar_url": self.avatar_url,
            "pelican_id": self.pelican_id,
        }

    def has_server(self, server_id: int) -> bool:
        """檢查用戶是否擁有指定 ID 的伺服器"""
        return any(server.id == server_id for server in self.servers)
