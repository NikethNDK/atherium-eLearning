from sqlalchemy.dialects.postgresql import ENUM
import enum


class PurchaseStatus(enum.Enum):
    PENDING = "PENDING"     
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentMethod(enum.Enum):
    WALLET = "WALLET"
    CARD = "CARD"
    UPI = "UPI"
    NET_BANKING = "NET_BANKING"

class VerificationStatus(enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class CourseLevel(enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    EXPERT = "EXPERT"
    ALL_LEVELS = "ALL_LEVELS"

class DurationUnit(enum.Enum):
    HOURS = "HOURS"
    DAYS = "DAYS"



class ContentType(str, enum.Enum):
    FILE = "FILE"
    VIDEO = "VIDEO"
    CAPTIONS = "CAPTIONS"
    DESCRIPTION = "DESCRIPTION"
    QUIZ = "QUIZ"
    LECTURE_NOTES = "LECTURE_NOTES"
    TEXT = "TEXT"
    ASSESSMENT = "ASSESSMENT"
    PDF = "PDF"
    REFERENCE_LINK = "REFERENCE_LINK"

# SQLAlchemy enum types
purchase_status_enum = ENUM(
    PurchaseStatus,
    name="purchasestatus",
    create_type=False
)

payment_method_enum = ENUM(
    PaymentMethod,
    name="paymentmethod",
    create_type=False
)

verification_status_enum = ENUM(
    VerificationStatus,
    name="verificationstatus",
    create_type=False
)

course_level_enum = ENUM(
    CourseLevel,
    name="courselevel",
    create_type=False
)

duration_unit_enum = ENUM(
    DurationUnit,
    name="durationunit",
    create_type=False
)

content_type_enum = ENUM(
    ContentType,
    name="contenttype",
    create_type=False
)


__all__ = [
    # Python enums
    "PurchaseStatus",
    "PaymentMethod",
    "VerificationStatus",
    "CourseLevel",
    "DurationUnit",
    "ContentType",
    # SQLAlchemy enum types
    "purchase_status_enum",
    "payment_method_enum",
    "verification_status_enum",
    "course_level_enum",
    "duration_unit_enum",
    "content_type_enum"
]