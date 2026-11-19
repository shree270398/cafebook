import os
import time
from datetime import datetime, timedelta

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


BASE_URL = os.getenv("CAFEBOOK_URL", "http://localhost:5173").rstrip("/")
ADMIN_EMAIL = os.getenv("CAFEBOOK_ADMIN_EMAIL", "admin@cafebook.com")
ADMIN_PASSWORD = os.getenv("CAFEBOOK_ADMIN_PASSWORD", "CafeBook@123")
WAIT_SECONDS = int(os.getenv("CAFEBOOK_WAIT_SECONDS", "20"))

timestamp = int(time.time())
customer_name = "Selenium Test Customer"
customer_email = f"selenium.customer.{timestamp}@example.com"
customer_password = "CafeTest@12345"


def text_element(driver, text, timeout=WAIT_SECONDS):
    wait = WebDriverWait(driver, timeout)
    return wait.until(
        EC.presence_of_element_located(
            (By.XPATH, f"//*[normalize-space(text())={text.__repr__()}]")
        )
    )


def click_text(driver, text, timeout=WAIT_SECONDS):
    element = text_element(driver, text, timeout)
    WebDriverWait(driver, timeout).until(EC.element_to_be_clickable(element))
    element.click()


def fill(driver, name, value):
    element = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located((By.NAME, name))
    )
    element.clear()
    element.send_keys(value)


def button_by_text(driver, text, timeout=WAIT_SECONDS):
    return WebDriverWait(driver, timeout).until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                f"//button[normalize-space(.)='{text}' or .//*[normalize-space(.)='{text}']]",
            )
        )
    )


def wait_for_url(driver, fragment):
    WebDriverWait(driver, WAIT_SECONDS).until(EC.url_contains(fragment))


def wait_for_page_heading(driver, text):
    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//h1[normalize-space()='{text}']")
        )
    )


def wait_for_heading_any_level(driver, text):
    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (By.XPATH, f"//*[self::h1 or self::h2][normalize-space()='{text}']")
        )
    )


def register_customer(driver):
    print("\n1. Registering a customer")
    driver.get(f"{BASE_URL}/register")

    fill(driver, "fullName", customer_name)
    fill(driver, "email", customer_email)
    fill(driver, "phone", "+919876543210")
    fill(driver, "password", customer_password)
    fill(driver, "confirmPassword", customer_password)

    button_by_text(driver, "Create account").click()
    wait_for_url(driver, "/book")
    print(f"   Registered: {customer_email}")


def book_table(driver):
    print("\n2. Booking a table")
    wait_for_page_heading(driver, "Reserve your table.")

    booking_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
    date_field = driver.find_element(By.XPATH, "//input[@type='date']")
    date_field.clear()
    date_field.send_keys(booking_date)

    guests_select = Select(driver.find_element(By.XPATH, "//select"))
    guests_select.select_by_value("2")

    time_buttons = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.presence_of_all_elements_located(
            (
                By.XPATH,
                "//button[@type='button']["
                "contains(normalize-space(.), 'AM') or "
                "contains(normalize-space(.), 'PM')]",
            )
        )
    )

    # Prefer an enabled, visible evening slot. Browser timezone is used for future dates.
    selected = False
    for button in time_buttons:
        label = button.text.strip()
        if ":" in label and button.is_enabled():
            button.click()
            selected = True
            break

    if not selected:
        raise RuntimeError("No time slot was available.")

    button_by_text(driver, "Check availability").click()

    available_table = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//button[not(@disabled) and "
                ".//span[normalize-space(.)='Available']]",
            )
        )
    )
    available_table.click()

    button_by_text(driver, "Continue").click()
    wait_for_heading_any_level(driver, "Confirm your reservation.")
    button_by_text(driver, "Confirm reservation").click()

    wait_for_page_heading(driver, "Your table is being held.")
    reference = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                "//p[normalize-space(.)='Booking reference']/following-sibling::p",
            )
        )
    ).text
    print(f"   Booking reference: {reference}")

    button_by_text(driver, "View my bookings").click()
    wait_for_url(driver, "/bookings")
    wait_for_page_heading(driver, "My bookings.")
    print("   Booking created and visible under My bookings")


def logout(driver):
    print("\n3. Logging out")
    driver.get(f"{BASE_URL}/")

    profile_button = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//button[@aria-haspopup='menu']",
            )
        )
    )
    profile_button.click()

    button = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space()='Sign out']")
        )
    )
    button.click()
    wait_for_url(driver, "/")
    print("   Customer signed out")


def admin_login_and_confirm_booking(driver):
    print("\n4. Admin login and booking confirmation")
    driver.get(f"{BASE_URL}/login")

    fill(driver, "email", ADMIN_EMAIL)
    fill(driver, "password", ADMIN_PASSWORD)
    button_by_text(driver, "Sign in").click()
    wait_for_url(driver, "/")

    driver.get(f"{BASE_URL}/admin/bookings")
    wait_for_page_heading(driver, "Bookings")

    confirm_button = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[.//*[normalize-space(.)='Confirm'] "
                       "or normalize-space(.)='Confirm']")
        )
    )
    confirm_button.click()

    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (
                By.XPATH,
                "//*[contains(normalize-space(.), 'Booking marked as confirmed')]",
            )
        )
    )
    print("   Booking confirmed by the administrator")


def verify_customer_can_see_confirmed_booking(driver):
    print("\n5. Verifying confirmation as the customer")
    logout(driver)
    driver.get(f"{BASE_URL}/login")

    fill(driver, "email", customer_email)
    fill(driver, "password", customer_password)
    button_by_text(driver, "Sign in").click()
    wait_for_url(driver, "/")

    driver.get(f"{BASE_URL}/bookings")
    wait_for_page_heading(driver, "My bookings.")

    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.visibility_of_element_located(
            (By.XPATH, "//*[contains(normalize-space(.), 'Confirmed')]")
        )
    )
    print("   Customer sees the confirmed reservation")


def main():
    options = webdriver.ChromeOptions()

    if os.getenv("CAFEBOOK_HEADLESS", "").lower() in ("1", "true", "yes"):
        options.add_argument("--headless=new")

    options.add_argument("--start-maximized")
    options.add_argument("--disable-notifications")

    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(2)

    try:
        driver.get(BASE_URL)
        print(f"CafeBook Selenium test: {BASE_URL}")

        register_customer(driver)
        book_table(driver)
        logout(driver)
        admin_login_and_confirm_booking(driver)
        verify_customer_can_see_confirmed_booking(driver)

        print("\nSelenium workflow completed successfully.")
    except Exception as error:
        screenshot = os.getenv(
            "CAFEBOOK_SCREENSHOT",
            "cafebook-selenium-failure.png",
        )
        driver.save_screenshot(screenshot)
        print(f"\nSelenium workflow failed. Screenshot: {screenshot}")
        raise
    finally:
        input("\nPress Enter to close the browser...")
        driver.quit()


if __name__ == "__main__":
    main()
