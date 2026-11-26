
document.addEventListener("DOMContentLoaded", () => {

    const foodItems = document.querySelectorAll(".food-item");

    foodItems.forEach(item => {
        const button = item.querySelector(".details-button");
        const details = item.querySelector(".food-details");

        button.setAttribute("aria-expanded", "false");

        button.addEventListener("click", () => {
            details.hidden = !details.hidden;

            button.textContent = details.hidden
                ? "View Details"
                : "Hide Details";

            button.setAttribute(
                "aria-expanded",
                String(!details.hidden)
            );
        });
    });


    const footer = document.querySelector("footer");
    const clock = document.createElement("p");

    clock.id = "current-time";
    footer.appendChild(clock);

    function updateClock() {
        const now = new Date();

        clock.textContent = "Current Date & Time: " +
            now.toLocaleString("en-GB", {
                dateStyle: "full",
                timeStyle: "medium"
            });
    }

    updateClock();
    setInterval(updateClock, 1000);



    const notification = document.createElement("div");
    notification.className = "notification";
    notification.setAttribute("role", "status");

    document.body.appendChild(notification);

    let notificationTimer;

    function showNotification(message, error = false) {
        clearTimeout(notificationTimer);

        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 25px;
            right: 25px;
            padding: 15px 20px;
            background: ${error ? "#dc3545" : "#28a745"};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            font-size: 14px;
        `;

        notification.hidden = false;

        notificationTimer = setTimeout(() => {
            notification.hidden = true;
        }, 3000);
    }

    notification.hidden = true;


   
  

    const menu = document.getElementById("menu");
    const searchBox = document.createElement("input");

    searchBox.type = "search";
    searchBox.placeholder = "Search for food...";
    searchBox.id = "food-search";
    searchBox.setAttribute("aria-label", "Search menu");

    menu.querySelector("h2").after(searchBox);

    const searchMessage = document.createElement("p");
    searchBox.after(searchMessage);

    searchBox.addEventListener("input", () => {
        const searchText = searchBox.value.trim().toLowerCase();
        let matches = 0;

        foodItems.forEach(item => {
            const name = item.querySelector("h3")
                .textContent.toLowerCase();

            const description = item.querySelector(".food-details")
                .textContent.toLowerCase();

            const found = name.includes(searchText) ||
                description.includes(searchText);

            item.hidden = !found;

            if (found) matches++;
        });

        searchMessage.textContent = searchText
            ? `${matches} food item(s) found`
            : "";
    });


    

    const cart = [];

    const cartSection = document.createElement("section");
    cartSection.id = "shopping-cart";

    cartSection.innerHTML = `
        <h2>Your Shopping Cart</h2>
        <div id="cart-items"></div>
        <h3 id="cart-total">Total: ₩0</h3>
        <button type="button" id="checkout">Checkout</button>
        <button type="button" id="clear-cart">Clear Cart</button>
    `;

    menu.after(cartSection);

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkout = document.getElementById("checkout");

    const formatPrice = price => "₩" + price.toLocaleString();




    foodItems.forEach(item => {
        const button = item.querySelector('a[href="#contact"]');
        const name = item.querySelector("h3").textContent.trim();

        const priceText = [...item.querySelectorAll("p")]
            .find(p => p.textContent.includes("Price:"))
            .textContent;

        const price = Number(priceText.replace(/[^\d]/g, ""));

        button.textContent = "Add to Cart";
        button.href = "#shopping-cart";

        button.addEventListener("click", event => {
            event.preventDefault();

            const existing = cart.find(food => food.name === name);

            if (existing) {
                existing.quantity++;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCart();
            showNotification(`${name} added to cart!`);
        });
    });


    function updateCart() {
        cartItems.replaceChildren();

        let total = 0;

        if (cart.length === 0) {
            cartItems.textContent = "Your cart is empty.";
        }

        cart.forEach((food, index) => {
            total += food.price * food.quantity;

            const row = document.createElement("div");
            row.className = "cart-item";

            const info = document.createElement("span");
            info.textContent =
                `${food.name} x ${food.quantity} — ` +
                formatPrice(food.price * food.quantity);

            const minus = document.createElement("button");
            minus.textContent = "−";
            minus.type = "button";

            const plus = document.createElement("button");
            plus.textContent = "+";
            plus.type = "button";

            const remove = document.createElement("button");
            remove.textContent = "Remove";
            remove.type = "button";

            minus.addEventListener("click", () => {
                food.quantity--;

                if (food.quantity === 0) {
                    cart.splice(index, 1);
                }

                updateCart();
            });

            plus.addEventListener("click", () => {
                food.quantity++;
                updateCart();
            });

            remove.addEventListener("click", () => {
                cart.splice(index, 1);
                updateCart();
                showNotification("Item removed from cart.");
            });

            row.append(info, minus, plus, remove);
            cartItems.appendChild(row);
        });

        cartTotal.textContent = "Total: " + formatPrice(total);
        checkout.disabled = cart.length === 0;
    }



    document.getElementById("clear-cart")
        .addEventListener("click", () => {

            if (cart.length === 0) return;

            cart.length = 0;
            updateCart();

            showNotification("Shopping cart cleared.");
        });



    checkout.addEventListener("click", () => {
        if (cart.length === 0) return;

        const summary = cart.map(food =>
            `${food.name} x ${food.quantity}`
        ).join("\n");

        const total = cart.reduce(
            (sum, food) => sum + food.price * food.quantity,
            0
        );

        document.getElementById("message").value =
            `I would like to order:\n${summary}\n\n` +
            `Total: ${formatPrice(total)}`;

        document.getElementById("contact").scrollIntoView({
            behavior: "smooth"
        });

        showNotification("Please complete your order details.");
    });



    const form = document.getElementById("contact-form");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !message) {
            showNotification("Please fill in all fields.", true);
            return;
        }

        if (!emailPattern.test(email)) {
            showNotification("Please enter a valid email.", true);
            return;
        }

        showNotification(`Thank you, ${name}! Form validated successfully.`);

      
        form.reset();
    });

    updateCart();

    console.log("Food4U is ready!");

});
