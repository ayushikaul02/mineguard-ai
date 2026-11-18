from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import User
from ..schemas.schemas import UserLogin, Token, UserResponse, UserCreate
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user, require_roles
from ..services.audit_service import record_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "mine_id": user.mine_id}
    )

    record_audit_log(
        db=db,
        user=user.username,
        action="LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        previous_value="",
        new_value=f"Role: {user.role}",
        description=f"User {user.username} ({user.role}) logged in successfully"
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "mine_id": user.mine_id,
            "email": user.email,
            "phone": user.phone
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "auditor"]))
):
    return db.query(User).all()

@router.post("/users", response_model=UserResponse)
def create_new_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(
        username=user_in.username,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        mine_id=user_in.mine_id,
        email=user_in.email,
        phone=user_in.phone,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    record_audit_log(
        db=db,
        user=current_user.username,
        action="CREATE",
        entity_type="User",
        entity_id=str(new_user.id),
        previous_value="",
        new_value=f"{new_user.username} ({new_user.role})",
        description=f"Created new user account: {new_user.username}"
    )

    return new_user
