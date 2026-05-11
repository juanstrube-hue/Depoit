import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.deposit_returns import Deposit_returnsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/deposit_returns", tags=["deposit_returns"])


# ---------- Pydantic Schemas ----------
class Deposit_returnsData(BaseModel):
    """Entity data schema (for create/update)"""
    contract_id: int
    amount_returned: int
    total_deductions: int = None
    status: str
    initiated_by: str = None
    notes: str = None


class Deposit_returnsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    contract_id: Optional[int] = None
    amount_returned: Optional[int] = None
    total_deductions: Optional[int] = None
    status: Optional[str] = None
    initiated_by: Optional[str] = None
    notes: Optional[str] = None


class Deposit_returnsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    contract_id: int
    amount_returned: int
    total_deductions: Optional[int] = None
    status: str
    initiated_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Deposit_returnsListResponse(BaseModel):
    """List response schema"""
    items: List[Deposit_returnsResponse]
    total: int
    skip: int
    limit: int


class Deposit_returnsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Deposit_returnsData]


class Deposit_returnsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Deposit_returnsUpdateData


class Deposit_returnsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Deposit_returnsBatchUpdateItem]


class Deposit_returnsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Deposit_returnsListResponse)
async def query_deposit_returnss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query deposit_returnss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying deposit_returnss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Deposit_returnsService(db)
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
        logger.debug(f"Found {result['total']} deposit_returnss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying deposit_returnss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Deposit_returnsListResponse)
async def query_deposit_returnss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query deposit_returnss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying deposit_returnss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Deposit_returnsService(db)
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
        logger.debug(f"Found {result['total']} deposit_returnss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying deposit_returnss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Deposit_returnsResponse)
async def get_deposit_returns(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single deposit_returns by ID (user can only see their own records)"""
    logger.debug(f"Fetching deposit_returns with id: {id}, fields={fields}")
    
    service = Deposit_returnsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Deposit_returns with id {id} not found")
            raise HTTPException(status_code=404, detail="Deposit_returns not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching deposit_returns {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Deposit_returnsResponse, status_code=201)
async def create_deposit_returns(
    data: Deposit_returnsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new deposit_returns"""
    logger.debug(f"Creating new deposit_returns with data: {data}")
    
    service = Deposit_returnsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create deposit_returns")
        
        logger.info(f"Deposit_returns created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating deposit_returns: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating deposit_returns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Deposit_returnsResponse], status_code=201)
async def create_deposit_returnss_batch(
    request: Deposit_returnsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple deposit_returnss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} deposit_returnss")
    
    service = Deposit_returnsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} deposit_returnss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Deposit_returnsResponse])
async def update_deposit_returnss_batch(
    request: Deposit_returnsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple deposit_returnss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} deposit_returnss")
    
    service = Deposit_returnsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} deposit_returnss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Deposit_returnsResponse)
async def update_deposit_returns(
    id: int,
    data: Deposit_returnsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing deposit_returns (requires ownership)"""
    logger.debug(f"Updating deposit_returns {id} with data: {data}")

    service = Deposit_returnsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Deposit_returns with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Deposit_returns not found")
        
        logger.info(f"Deposit_returns {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating deposit_returns {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating deposit_returns {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_deposit_returnss_batch(
    request: Deposit_returnsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple deposit_returnss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} deposit_returnss")
    
    service = Deposit_returnsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} deposit_returnss successfully")
        return {"message": f"Successfully deleted {deleted_count} deposit_returnss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_deposit_returns(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single deposit_returns by ID (requires ownership)"""
    logger.debug(f"Deleting deposit_returns with id: {id}")
    
    service = Deposit_returnsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Deposit_returns with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Deposit_returns not found")
        
        logger.info(f"Deposit_returns {id} deleted successfully")
        return {"message": "Deposit_returns deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting deposit_returns {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")