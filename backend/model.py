<<<<<<< HEAD
from pydantic import BaseModel,Field
from uuid import UUID, uuid4
from typing import Optional
class Reviews(BaseModel):
    review:str
class Review_result(BaseModel):
    id:UUID = Field(default_factory=uuid4)
    review_text:str
    sentiment:str
    theme:str
    suggested_response:str
class updated_review(BaseModel):

    review_text:Optional[str]=None
    sentiment:Optional[str]=None
    theme:Optional[str]=None
=======
from pydantic import BaseModel,Field
from uuid import UUID, uuid4
from typing import Optional
class Reviews(BaseModel):
    review:str
class Review_result(BaseModel):
    id:UUID = Field(default_factory=uuid4)
    review_text:str
    sentiment:str
    theme:str
    suggested_response:str
class updated_review(BaseModel):

    review_text:Optional[str]=None
    sentiment:Optional[str]=None
    theme:Optional[str]=None
>>>>>>> 5750c773f3f4c838418aec8aca7a39714945568f
    suggested_response:Optional[str]=None