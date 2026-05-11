import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.contracts import ContractsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/contracts", tags=["contracts"])


# ---------- Pydantic Schemas ----------
class ContractsData(BaseModel):
    """Entity data schema (for create/update)"""
    landlord_name: str
    landlord_email: str = None
    tenant_name: str
    tenant_email: str = None
    broker_name: str = None
    broker_email: str = None
    property_address: str
    property_city: str = None
    property_region: str = None
    property_type: str = None
    rent_amount: int
    deposit_amount: int
    start_date: str = None
    end_date: str = None
    status: str
    yield_generated: int = None
    signed_at: str = None
    deposit_received_at: str = None


class ContractsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    landlord_name: Optional[str] = None
    landlord_email: Optional[str] = None
    tenant_name: Optional[str] = None
    tenant_email: Optional[str] = None
    broker_name: Optional[str] = None
    broker_email: Optional[str] = None
    property_address: Optional[str] = None
    property_city: Optional[str] = None
    property_region: Optional[str] = None
    property_type: Optional[str] = None
    rent_amount: Optional[int] = None
    deposit_amount: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = None
    yield_generated: Optional[int] = None
    signed_at: Optional[str] = None
    deposit_received_at: Optional[str] = None


class ContractsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    landlord_name: str
    landlord_email: Optional[str] = None
    tenant_name: str
    tenant_email: Optional[str] = None
    broker_name: Optional[str] = None
    broker_email: Optional[str] = None
    property_address: str
    property_city: Optional[str] = None
    property_region: Optional[str] = None
    property_type: Optional[str] = None
    rent_amount: int
    deposit_amount: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: str
    yield_generated: Optional[int] = None
    signed_at: Optional[str] = None
    deposit_received_at: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContractsListResponse(BaseModel):
    """List response schema"""
    items: List[ContractsResponse]
    total: int
    skip: int
    limit: int


class ContractsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[ContractsData]


class ContractsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: ContractsUpdateData


class ContractsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[ContractsBatchUpdateItem]


class ContractsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=ContractsListResponse)
async def query_contractss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query contractss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying contractss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = ContractsService(db)
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
        logger.debug(f"Found {result['total']} contractss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying contractss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=ContractsListResponse)
async def query_contractss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query contractss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying contractss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = ContractsService(db)
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
        logger.debug(f"Found {result['total']} contractss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying contractss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=ContractsResponse)
async def get_contracts(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single contracts by ID (user can only see their own records)"""
    logger.debug(f"Fetching contracts with id: {id}, fields={fields}")
    
    service = ContractsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Contracts with id {id} not found")
            raise HTTPException(status_code=404, detail="Contracts not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching contracts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=ContractsResponse, status_code=201)
async def create_contracts(
    data: ContractsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new contracts"""
    logger.debug(f"Creating new contracts with data: {data}")
    
    service = ContractsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create contracts")
        
        logger.info(f"Contracts created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating contracts: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating contracts: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[ContractsResponse], status_code=201)
async def create_contractss_batch(
    request: ContractsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple contractss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} contractss")
    
    service = ContractsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} contractss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[ContractsResponse])
async def update_contractss_batch(
    request: ContractsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple contractss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} contractss")
    
    service = ContractsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} contractss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=ContractsResponse)
async def update_contracts(
    id: int,
    data: ContractsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing contracts (requires ownership)"""
    logger.debug(f"Updating contracts {id} with data: {data}")

    service = ContractsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Contracts with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Contracts not found")
        
        logger.info(f"Contracts {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating contracts {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating contracts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_contractss_batch(
    request: ContractsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple contractss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} contractss")
    
    service = ContractsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} contractss successfully")
        return {"message": f"Successfully deleted {deleted_count} contractss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_contracts(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single contracts by ID (requires ownership)"""
    logger.debug(f"Deleting contracts with id: {id}")
    
    service = ContractsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Contracts with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Contracts not found")
        
        logger.info(f"Contracts {id} deleted successfully")
        return {"message": "Contracts deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting contracts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")