import os
import sys
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configuration from environment variables with sensible defaults
BASE_URL = os.getenv("CAFEBOOK_URL", "https://cafebook-two.vercel.app").rstrip("/")
CUSTOMER_EMAIL = os.getenv("CAFEBOOK_CUSTOMER_EMAIL", "test1@gmail.com")
CUSTOMER_PASSWORD = os.getenv("CAFEBOOK_CUSTOMER_PASSWORD", "9916925969")
WAIT_TIMEOUT = int(os.getenv("CAFEBOOK_WAIT_TIMEOUT", "15"))

# Initialize Chrome WebDriver
driver = webdriver.Chrome()
driver.maximize_window()
wait = WebDriverWait(driver, WAIT_TIMEOUT)

def safe_click(element):
    """Scrolls into view and clicks via JavaScript to avoid overlaps or intercepts."""
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    driver.execute_script("arguments[0].click();", element)

try:
    # -------------------------------------------------------------
    # 1. Open the deployed CafeBook website & Navigate to Login
    # -------------------------------------------------------------
    driver.get(BASE_URL)
    
    # Click "Sign in" in the navbar
    sign_in_link = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Sign in']"))
    )
    safe_click(sign_in_link)
    
    # -------------------------------------------------------------
    # 2. Login using existing customer account
    # -------------------------------------------------------------
    email_field = wait.until(EC.visibility_of_element_located((By.NAME, "email")))
    email_field.clear()
    email_field.send_keys(CUSTOMER_EMAIL)
    
    password_field = driver.find_element(By.NAME, "password")
    password_field.clear()
    password_field.send_keys(CUSTOMER_PASSWORD)
    
    submit_btn = driver.find_element(
        By.XPATH, "//button[@type='submit' and contains(., 'Sign in')]"
    )
    safe_click(submit_btn)
    
    # -------------------------------------------------------------
    # 3. Verify successful login
    # -------------------------------------------------------------
    # Check that URL leaves /login and customer avatar/menu button appears
    wait.until(lambda d: "/login" not in d.current_url)
    wait.until(EC.presence_of_element_located((By.XPATH, "//button[@aria-haspopup='menu']")))
    print("Customer login successful.")

    # -------------------------------------------------------------
    # 4. Navigate to Book a Table page
    # -------------------------------------------------------------
    hero_reserve_btn = wait.until(
        EC.presence_of_element_located(
            (By.XPATH, "//a[@href='/book' and contains(@class, 'px-7 py-3.5') and contains(., 'Reserve a table')]")
        )
    )
    safe_click(hero_reserve_btn)
    wait.until(EC.url_contains("/book"))
    print("Booking page opened.")

    # -------------------------------------------------------------
    # 5. Automatically calculate and select tomorrow's date
    # -------------------------------------------------------------
    tomorrow_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    date_input = wait.until(EC.visibility_of_element_located((By.XPATH, "//input[@type='date']")))
    date_input.clear()
    date_input.send_keys(tomorrow_date)
    print("Tomorrow's date selected.")

    # -------------------------------------------------------------
    # 6. Select 2 guests & available booking time slot
    # -------------------------------------------------------------
    guests_select = Select(driver.find_element(By.XPATH, "//select"))
    guests_select.select_by_value("2")

    time_slots = wait.until(
        EC.presence_of_all_elements_located(
            (By.XPATH, "//button[@type='button'][contains(., 'AM') or contains(., 'PM')]")
        )
    )
    
    selected_slot = None
    for slot in time_slots:
        if slot.is_enabled():
            selected_slot = slot.text.strip()
            safe_click(slot)
            break
            
    if not selected_slot:
        raise Exception("No active time slot available for the selected date.")

    # -------------------------------------------------------------
    # 7. Check table availability & select an available table
    # -------------------------------------------------------------
    check_avail_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Check availability']")
    safe_click(check_avail_btn)

    available_table_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[not(@disabled) and .//span[normalize-space()='Available']]")
        )
    )
    safe_click(available_table_btn)
    print("Available table selected.")

    # Click Continue to Step 3 (Confirmation summary)
    continue_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Continue']"))
    )
    safe_click(continue_btn)

    # -------------------------------------------------------------
    # 8. Confirm the table booking
    # -------------------------------------------------------------
    confirm_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Confirm reservation']"))
    )
    safe_click(confirm_btn)

    # Capture booking reference from confirmation screen
    booking_ref_element = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(text(), 'CB-')]")
        )
    )
    booking_reference = booking_ref_element.text.strip()
    print("Booking confirmed successfully.")

    # -------------------------------------------------------------
    # 9. Navigate to My Bookings
    # -------------------------------------------------------------
    view_bookings_btn = wait.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//a[normalize-space()='View my bookings' or contains(., 'View my bookings')]")
        )
    )
    safe_click(view_bookings_btn)
    wait.until(EC.url_contains("/bookings"))
    print("My Bookings page opened.")

    # -------------------------------------------------------------
    # 10. Verify that the newly created booking is displayed
    # -------------------------------------------------------------
    # Look for the booking reference on the My Bookings page
    verified_ref_element = wait.until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//article[contains(., '{booking_reference}')] | //*[contains(text(), '{booking_reference}')]")
        )
    )
    
    print("Booking verified successfully.")
    print(f"\n--- Booking Details ---")
    print(f"Booking Reference : {booking_reference}")
    print(f"Customer Email    : {CUSTOMER_EMAIL}")
    print(f"Date              : {tomorrow_date}")
    print(f"Time Slot         : {selected_slot}")
    print(f"Guests            : 2")
    print("-----------------------\n")
    print("FINAL RESULT: PASS")

except Exception as err:
    screenshot_file = "booking_failure.png"
    driver.save_screenshot(screenshot_file)
    print(f"\nFailure during test execution: {err}")
    print(f"Saved failure screenshot to '{screenshot_file}'")
    print("\nFINAL RESULT: FAIL")
    sys.exit(1)

finally:
    driver.quit()
