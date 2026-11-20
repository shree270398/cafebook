import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 0. Open the website home page
driver = webdriver.Chrome()
driver.get("https://cafebook-two.vercel.app/")
driver.maximize_window()
wait = WebDriverWait(driver, 15)
time.sleep(2)

def safe_click(element):
    """Scroll into view and click via JavaScript to avoid overlaps or intercepts."""
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", element)

# -------------------------------------------------------------
# 1. Click "Sign in" link in the Navbar
# -------------------------------------------------------------
print("Step 1: Clicking 'Sign in' in navbar...", flush=True)
sign_in_link = wait.until(
    EC.element_to_be_clickable((By.XPATH, "//a[normalize-space()='Sign in']"))
)
safe_click(sign_in_link)

# -------------------------------------------------------------
# 2. Fill login form (test1@gmail.com / 9916925969)
# -------------------------------------------------------------
print("Step 2: Entering email and password in login form...", flush=True)
email_input = wait.until(EC.visibility_of_element_located((By.NAME, "email")))
email_input.clear()
email_input.send_keys("test1@gmail.com")

password_input = driver.find_element(By.NAME, "password")
password_input.clear()
password_input.send_keys("9916925969")

# Click "Sign in" button
submit_button = driver.find_element(
    By.XPATH, "//button[@type='submit' and contains(., 'Sign in')]"
)
safe_click(submit_button)

# -------------------------------------------------------------
# 3. Wait for login redirect & click Hero "Reserve a table"
# -------------------------------------------------------------
print("Step 3: Waiting for login redirect to complete...", flush=True)
# Wait until URL returns to home '/'
wait.until(lambda d: "/login" not in d.current_url)

# Wait until user session is active (navbar displays user initials/profile dropdown)
wait.until(EC.presence_of_element_located((By.XPATH, "//button[@aria-haspopup='menu']")))
print("User 'shree' logged in!", flush=True)

# Directly target the Hero 'Reserve a table' button matching inspect classes & href
print("Clicking Hero 'Reserve a table' button...", flush=True)
hero_reserve_btn = wait.until(
    EC.presence_of_element_located(
        (
            By.XPATH,
            "//a[@href='/book' and contains(@class, 'px-7 py-3.5') and contains(., 'Reserve a table')]"
        )
    )
)
safe_click(hero_reserve_btn)

# Ensure booking page has loaded
wait.until(EC.url_contains("/book"))
print("Landed on Reserve Table page!", flush=True)

# -------------------------------------------------------------
# 4. Set reservation date to 22-11-2026
# -------------------------------------------------------------
print("Step 4: Locating date picker element and setting date to 2026-11-22...", flush=True)
date_picker = wait.until(EC.visibility_of_element_located((By.XPATH, "//input[@type='date']")))
date_picker.clear()
date_picker.send_keys("2026-11-22")
time.sleep(1)

# Select number of guests from dropdown (2 guests)
guests_dropdown = Select(driver.find_element(By.XPATH, "//select"))
guests_dropdown.select_by_value("2")
time.sleep(1)

# Click the first enabled time slot button (AM / PM)
print("Selecting available time slot...", flush=True)
time_buttons = wait.until(
    EC.presence_of_all_elements_located(
        (By.XPATH, "//button[@type='button'][contains(., 'AM') or contains(., 'PM')]")
    )
)
for btn in time_buttons:
    if btn.is_enabled():
        safe_click(btn)
        break
time.sleep(1)

# Click "Check availability" button
check_avail_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Check availability']")
safe_click(check_avail_btn)

# -------------------------------------------------------------
# 5. Pick an available table (Step 2 of booking)
# -------------------------------------------------------------
print("Step 5: Selecting available table from table grid...", flush=True)
available_table_card = wait.until(
    EC.element_to_be_clickable(
        (By.XPATH, "//button[not(@disabled) and .//span[normalize-space()='Available']]")
    )
)
safe_click(available_table_card)
time.sleep(1)

# Click "Continue" button
continue_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Continue']")
safe_click(continue_btn)

# -------------------------------------------------------------
# 6. Confirm the reservation (Step 3 of booking)
# -------------------------------------------------------------
print("Step 6: Clicking 'Confirm reservation'...", flush=True)
confirm_btn = wait.until(
    EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space()='Confirm reservation']")
    )
)
safe_click(confirm_btn)

# -------------------------------------------------------------
# 7. View reservation details on confirmation screen
# -------------------------------------------------------------
print("Step 7: Clicking 'View my bookings' button...", flush=True)
view_bookings_btn = wait.until(
    EC.element_to_be_clickable(
        (By.XPATH, "//a[normalize-space()='View my bookings' or contains(., 'View my bookings')]")
    )
)
safe_click(view_bookings_btn)

wait.until(EC.url_contains("/bookings"))
print("Flow finished successfully by interacting exclusively with UI elements!", flush=True)

input("Press enter to close the browser.....")
driver.quit()
