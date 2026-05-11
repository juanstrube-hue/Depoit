import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.deposit_deductions import Deposit_deductionsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/deposit_deductions", tags=["deposit_deductions"])


# ---------- Pydantic Schemas ----------
class Deposit_deductionsData(BaseModel):
    """Entity data schema (for create/update)"""
    contract_id: int
    category: str
    description: str = None
    amount: int
    evidence_url: str = None
    status: str
    tenant_comment: str = None


class Deposit_deductionsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    contract_id: Optional[int] = None
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[int] = None
    evidence_url: Optional[str] = None
    status: Optional[str] = None
    tenant_comment: Optional[str] = None


class Deposit_deductionsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    contract_id: int
    category: str
    description: Optional[str] = None
    amount: int
    evidence_url: Optional[str] = None
    status: str
    tenant_comment: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Deposit_deductionsListResponse(BaseModel):
    """List response schema"""
    items: List[Deposit_deductionsResponse]
    total: int
    skip: int
    limit: int


class Deposit_deductionsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Deposit_deductionsData]


class Deposit_deductionsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Deposit_deductionsUpdateData


class Deposit_deductionsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Deposit_deductionsBatchUpdateItem]


class Deposit_deductionsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Deposit_deductionsListResponse)
async def query_deposit_deductionss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query deposit_deductionss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying deposit_deductionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Deposit_deductionsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} deposit_deductionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying deposit_deductionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Deposit_deductionsListResponse)
async def query_deposit_deductionss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query deposit_deductionss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying deposit_deductionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Deposit_deductionsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} deposit_deductionss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying deposit_deductionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Deposit_deductionsResponse)
async def get_deposit_deductions(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single deposit_deductions by ID (user can only see their own records)"""
    logger.debug(f"Fetching deposit_deductions with id: {id}, fields={fields}")
    
    service = Deposit_deductionsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Deposit_deductions with id {id} not found")
            raise HTTPException(status_code=404, detail="Deposit_deductions not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deposit_deductions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Deposit_deductionsResponse, status_code=201)
async def create_deposit_deductions(
    data: Deposit_deductionsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new deposit_deductions"""
    logger.debug(f"Creating new deposit_deductions with data: {data}")
    
    service = Deposit_deductionsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create deposit_deductions")
        
        logger.info(f"Deposit_deductions created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating deposit_deductions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating deposit_deductions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Deposit_deductionsResponse], status_code=201)
async def create_deposit_deductionss_batch(
    request: Deposit_deductionsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple deposit_deductionss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} deposit_deductionss")
    
    service = Deposit_deductionsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} deposit_deductionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Deposit_deductionsResponse])
async def update_deposit_deductionss_batch(
    request: Deposit_deductionsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple deposit_deductionss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} deposit_deductionss")
    
    service = Deposit_deductionsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} deposit_deductionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Deposit_deductionsResponse)
async def update_deposit_deductions(
    id: int,
    data: Deposit_deductionsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing deposit_deductions (requires ownership)"""
    logger.debug(f"Updating deposit_deductions {id} with data: {data}")

    service = Deposit_deductionsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Deposit_deductions with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Deposit_deductions not found")
        
        logger.info(f"Deposit_deductions {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating deposit_deductions {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating deposit_deductions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_deposit_deductionss_batch(
    request: Deposit_deductionsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple deposit_deductionss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} deposit_deductionss")
    
    service = Deposit_deductionsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} deposit_deductionss successfully")
        return {"message": f"Successfully deleted {deleted_count} deposit_deductionss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_deposit_deductions(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single deposit_deductions by ID (requires ownership)"""
    logger.debug(f"Deleting deposit_deductions with id: {id}")
    
    service = Deposit_deductionsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Deposit_deductions with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Deposit_deductions not found")
        
        logger.info(f"Deposit_deductions {id} deleted successfully")
        return {"message": "Deposit_deductions deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting deposit_deductions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")