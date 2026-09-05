import re
from playwright.sync_api import Page, expect

def test_wizard_and_chat_flow(page: Page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")
    
    # 2. Check title
    expect(page.locator("h1")).to_contain_text("RuralNex AI")
    
    # 3. Fill out the proposal form (Step 1)
    page.get_by_placeholder("e.g. Pune").fill("Satara")
    page.get_by_placeholder("e.g. Ralegan Siddhi").fill("Shirwal")
    page.get_by_placeholder("e.g. Retail, Agriculture").fill("Agri-Tech")
    page.get_by_placeholder("Your contribution (e.g. 10000)").fill("20000")
    
    # 4. Submit and advance to Step 2 (Financial Assessment)
    page.get_by_role("button", name="Calculate Feasibility").click()
    
    # Expect deterministic results
    expect(page.locator("text=Micro Finance Scheme")).to_be_visible()
    expect(page.locator("text=₹200000")).to_be_visible() # 10x margin for project cost
    
    # 5. Generate Report (Step 3)
    page.get_by_role("button", name="Generate AI Market Report").click()
    
    # Check loading state
    expect(page.locator("text=Analyzing Local Market Data...")).to_be_visible()
    
    # 6. View Report Dashboard (Step 4)
    # The timeout simulates waiting for Celery/AI processing
    expect(page.locator("h1:has-text('Feasibility Report')")).to_be_visible(timeout=5000)
    
    # 7. Test AI Assistant Chat
    page.get_by_role("button", name="💬 Ask AI").click()
    
    # Assistant greets
    expect(page.locator("text=Namaste! I am the RuralNex AI.")).to_be_visible()
    
    # Send a message
    page.get_by_placeholder("Ask about finances or SWOT...").fill("What is my max loan?")
    page.get_by_role("button", name="Send").click()
    
    # Expect mock AI response
    expect(page.locator("text=Based on the deterministic backend calculation")).to_be_visible(timeout=3000)
