"""
AeroTwin Inventory & Theft Prevention API — Phase 10
RFID/QR tracking, stock prediction, theft alerts
"""
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlmodel import Session, select
from typing import Optional, List
from database import get_session, InventoryItem, InventoryTransaction, TheftAlert

router = APIRouter(prefix="/inventory", tags=["Inventory & Theft"])

@router.get("/items")
def list_items(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(InventoryItem)
    if project_id:
        query = query.where(InventoryItem.project_id == project_id)
    return session.exec(query).all()

@router.post("/items")
def create_item(
    project_id: int = Form(...),
    name: str = Form(...),
    category: str = Form("Materials"),
    quantity: float = Form(0.0),
    unit: str = Form("kg"),
    min_threshold: float = Form(10.0),
    warehouse: str = Form("Main Store"),
    unit_cost: float = Form(0.0),
    session: Session = Depends(get_session)
):
    status = "in_stock"
    if quantity == 0:
        status = "out_of_stock"
    elif quantity <= min_threshold:
        status = "low_stock"
        
    item = InventoryItem(
        project_id=project_id,
        name=name,
        category=category,
        quantity=quantity,
        unit=unit,
        min_threshold=min_threshold,
        warehouse=warehouse,
        unit_cost=unit_cost,
        status=status,
        rfid_tag=f"RFID-{random.randint(1000, 9999)}",
        qr_code=f"QR-{random.randint(1000, 9999)}"
    )
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@router.post("/transactions")
def log_transaction(
    item_id: int = Form(...),
    transaction_type: str = Form(...),  # entry, exit
    quantity: float = Form(...),
    scanned_by: str = Form("admin"),
    scan_method: str = Form("manual"),
    session: Session = Depends(get_session)
):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(404, "Item not found")
        
    # Check for anomalies (Theft detection simulation)
    if transaction_type == "exit":
        hour = datetime.datetime.utcnow().hour
        # If exit happens outside 6 AM - 8 PM, flag as suspicious
        if hour < 6 or hour > 20:
            alert = TheftAlert(
                item_id=item_id,
                probability=92.5,
                missing_qty=quantity,
                expected_qty=item.quantity,
                actual_qty=item.quantity - quantity,
                location=item.warehouse,
                anomaly_type="after_hours"
            )
            session.add(alert)
    
    # Update inventory balance
    if transaction_type == "entry":
        item.quantity += quantity
    elif transaction_type == "exit":
        item.quantity = max(0, item.quantity - quantity)
        
    # Update status
    if item.quantity == 0:
        item.status = "out_of_stock"
    elif item.quantity <= item.min_threshold:
        item.status = "low_stock"
    else:
        item.status = "in_stock"
        
    session.add(item)
    
    trans = InventoryTransaction(
        item_id=item_id,
        transaction_type=transaction_type,
        quantity=quantity,
        scanned_by=scanned_by,
        scan_method=scan_method
    )
    session.add(trans)
    session.commit()
    session.refresh(trans)
    
    return {"message": "Transaction logged", "transaction": trans, "new_quantity": item.quantity}

@router.get("/alerts")
def get_theft_alerts(project_id: Optional[int] = None, session: Session = Depends(get_session)):
    query = select(TheftAlert).where(TheftAlert.resolved == False)
    # Join with items to filter by project (simple simulation here)
    alerts = session.exec(query).all()
    
    # Enrich with item data
    result = []
    for alert in alerts:
        item = session.get(InventoryItem, alert.item_id)
        if not project_id or (item and item.project_id == project_id):
            result.append({
                "alert": alert,
                "item_name": item.name if item else "Unknown",
                "unit": item.unit if item else ""
            })
            
    return result

@router.post("/alerts/{alert_id}/resolve")
def resolve_theft_alert(alert_id: int, session: Session = Depends(get_session)):
    alert = session.get(TheftAlert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")
    alert.resolved = True
    session.add(alert)
    session.commit()
    return {"message": "Alert resolved"}
