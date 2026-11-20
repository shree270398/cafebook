import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

# 0. Open the website home page (starts from root, navigating through UI elements)
driver = webdriver.Chrome()
driver.get("https://cafebook-two.vercel.app/")
driver.maximize_window()
time.sleep(3)

# -------------------------------------------------------------
# 1. Click "Sign in" link in the Navbar
# -------------------------------------------------------------
print("Step 1: Clicking 'Sign in' link in the navigation bar...")
sign_in_link = driver.find_element(By.XPATH, "//a[normalize-space()='Sign in']")
sign_in_link.click()
time.sleep(3)

# -------------------------------------------------------------
# 2. Fill login form (test1@gmail.com / 9916925969)
# -------------------------------------------------------------
print("Step 2: Entering email and password in login form...")
email_input = driver.find_element(By.NAME, "email")
email_input.clear()
email_input.send_keys("test1@gmail.com")
time.sleep(1)

password_input = driver.find_element(By.NAME, "password")
password_input.clear()
password_input.send_keys("9916925969")
time.sleep(1)

# Click "Sign in" button in form
submit_button = driver.find_element(By.XPATH, "//button[@type='submit' and contains(., 'Sign in')]")
submit_button.click()
time.sleep(4)

# -------------------------------------------------------------
# 3. Click "Reserve a table" button on the webpage
# -------------------------------------------------------------
print("Step 3: Clicking 'Reserve a table' button in the page header/hero...")
reserve_btn = driver.find_element(
    By.XPATH, "//a[normalize-space()='Reserve a table' or contains(., 'Reserve a table')]"
)
reserve_btn.click()
time.sleep(3)

# -------------------------------------------------------------
# 4. Set reservation date to 22-11-2026 (Step 1 of booking)
# -------------------------------------------------------------
print("Step 4: Locating date picker element and setting date to 2026-11-22...")
date_picker = driver.find_element(By.XPATH, "//input[@type='date']")
date_picker.clear()
date_picker.send_keys("2026-11-22")
time.sleep(1)

# Select number of guests from dropdown
guests_dropdown = Select(driver.find_element(By.XPATH, "//select"))
guests_dropdown.select_by_value("2")
time.sleep(1)

# Click the first enabled time slot button (AM / PM)
print("Selecting available time slot...")
time_buttons = driver.find_elements(
    By.XPATH, "//button[@type='button'][contains(., 'AM') or contains(., 'PM')]"
)
for btn in time_buttons:
    if btn.is_enabled():
        btn.click()
        break
time.sleep(1)

# Click "Check availability" button
check_avail_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Check availability']")
check_avail_btn.click()
time.sleep(3)

# -------------------------------------------------------------
# 5. Pick an available table (Step 2 of booking)
# -------------------------------------------------------------
print("Step 5: Selecting available table from table grid...")
available_table_card = driver.find_element(
    By.XPATH, "//button[not(@disabled) and .//span[normalize-space()='Available']]"
)
available_table_card.click()
time.sleep(2)

# Click "Continue" button
continue_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Continue']")
continue_btn.click()
time.sleep(2)

# -------------------------------------------------------------
# 6. Confirm the reservation (Step 3 of booking)
# -------------------------------------------------------------
print("Step 6: Clicking 'Confirm reservation'...")
confirm_btn = driver.find_element(By.XPATH, "//button[normalize-space()='Confirm reservation']")
confirm_btn.click()
time.sleep(4)

# -------------------------------------------------------------
# 7. View reservation details on confirmation screen
# -------------------------------------------------------------
print("Step 7: Clicking 'View my bookings' button...")
view_bookings_btn = driver.find_element(
    By.XPATH, "//a[normalize-space()='View my bookings' or contains(., 'View my bookings')]"
)
view_bookings_btn.click()
time.sleep(3)

print("Flow finished successfully by interacting exclusively with UI elements!")

input("Press enter to close the browser.....")
driver.quit()