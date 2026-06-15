// Cart Management
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('bluephone-cart')) || [];
} catch (e) {
    cart = [];
}
const cartBadge = document.querySelector('.cart-count');
const cartItemsContainer = document.getElementById('cartItems');
const totalAmountDisplay = document.getElementById('totalAmount');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartIcon = document.querySelector('.cart-icon');
const closeCartBtn = document.querySelector('.close-cart');

// Toggle Cart
const toggleCart = () => {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }
};

if (cartIcon) cartIcon.addEventListener('click', toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

// Discount coupon code state
let discountApplied = false;

// Update Cart UI
const updateCartUI = () => {
    try {
        localStorage.setItem('bluephone-cart', JSON.stringify(cart));
    } catch (e) { }

    // Update Badge
    if (cartBadge) {
        cartBadge.textContent = cart.length;
    }

    // Update List
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Sepetiniz boş.</p>';
        totalAmountDisplay.textContent = '0 ₺';

        // Hide coupon code message if cart is empty
        document.querySelectorAll('.discount-message').forEach(msg => msg.style.display = 'none');
        discountApplied = false;
    } else {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const price = parseInt(item.price.replace(/[^0-9]/g, ''));
            total += price;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4 style="font-size: 0.9rem;">${item.name}</h4>
                    <p style="color: var(--primary); font-weight: 700;">${item.price}</p>
                </div>
                <i class="fa-solid fa-trash" style="cursor: pointer; color: #ff4444;" onclick="removeFromCart(${index})"></i>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        if (discountApplied) {
            const discountAmount = total * 0.1;
            const discountedTotal = total - discountAmount;
            totalAmountDisplay.innerHTML = `<span style="text-decoration: line-through; color: var(--text-muted); font-size: 0.9rem; margin-right: 0.5rem;">${total.toLocaleString('tr-TR')} ₺</span> ${discountedTotal.toLocaleString('tr-TR')} ₺`;
        } else {
            totalAmountDisplay.textContent = total.toLocaleString('tr-TR') + ' ₺';
        }
    }
};

// Initialize Cart UI on load
updateCartUI();

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// Add to Cart Logic
document.querySelectorAll('.product-card').forEach(card => {
    const btn = card.querySelector('.addToCart');
    if (!btn) return;
    const name = card.querySelector('h3').textContent;
    const price = card.querySelector('.product-price').textContent;
    const imgElement = card.querySelector('.product-img');
    const image = imgElement ? imgElement.src : '';

    btn.addEventListener('click', () => {
        cart.push({ name, price, image });
        updateCartUI();

        // Open cart automatically on first item
        if (cart.length === 1) toggleCart();

        // Button Animation
        const originalText = btn.textContent;
        btn.textContent = 'Eklendi!';
        btn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1500);
    });
});

// Redirect to payment page when clicking "Ödemeye Geç"
document.querySelectorAll('.cart-sidebar .btn-primary').forEach(btn => {
    if (btn.textContent.trim() === 'Ödemeye Geç') {
        btn.addEventListener('click', () => {
            window.location.href = 'payment.html';
        });
    }
});

// Scroll Reveal Effect
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'all 0.8s ease-out';
    observer.observe(section);
});

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Hero Parallax Effect
const heroImage = document.querySelector('.hero-image img');
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.02;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.02;
    if (heroImage) {
        heroImage.style.transform = `translate(${moveX}px, ${moveY}px) translateY(-10px)`;
    }
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '10px 0';
        nav.style.background = 'rgba(3, 7, 18, 0.95)';
    } else {
        nav.style.padding = '0';
        nav.style.background = 'rgba(3, 7, 18, 0.8)';
    }
});

// Product Category & Search Filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

// Turkish case normalization function
const normalizeString = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .trim();
};

const filterProducts = () => {
    const searchInput = document.getElementById('searchInput');
    const query = normalizeString(searchInput ? searchInput.value : '');
    const activeBtn = document.querySelector('.filter-btn.active');
    const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';

    productCards.forEach(card => {
        const h3Elem = card.querySelector('h3');
        const pElem = card.querySelector('p');
        const name = h3Elem ? normalizeString(h3Elem.textContent) : '';
        const desc = pElem ? normalizeString(pElem.textContent) : '';
        const cardCategory = card.getAttribute('data-category');

        if (!cardCategory) return;

        // Map categories to Turkish search synonyms
        let categoryText = '';
        if (cardCategory === 'phone') categoryText = 'telefon akilli telefon phone cep telefonu lite flagship x1 pro';
        else if (cardCategory === 'sound') categoryText = 'ses sistemleri kulaklik buds pro sound hoparlor';
        else if (cardCategory === 'accessory') categoryText = 'aksesuarlar saat tablet watch tab accessory kilif ekran koruyucu';
        categoryText = normalizeString(categoryText);

        const matchesQuery = name.includes(query) || desc.includes(query) || categoryText.includes(query);
        const matchesCategory = category === 'all' || cardCategory === category;

        if (matchesQuery && matchesCategory) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                const currentActiveBtn = document.querySelector('.filter-btn.active');
                const currentCategory = currentActiveBtn ? currentActiveBtn.getAttribute('data-category') : 'all';
                const currentQuery = normalizeString(searchInput ? searchInput.value : '');
                const currentMatchesQuery = name.includes(currentQuery) || desc.includes(currentQuery) || categoryText.includes(currentQuery);
                const currentMatchesCategory = currentCategory === 'all' || cardCategory === currentCategory;

                if (!currentMatchesQuery || !currentMatchesCategory) {
                    card.style.display = 'none';
                }
            }, 300);
        }
    });
};

if (filterButtons.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Fade out first
            productCards.forEach(card => {
                if (card.getAttribute('data-category')) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                }
            });

            setTimeout(filterProducts, 300);
        });
    });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', filterProducts);

    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.style.pointerEvents = 'auto';
        searchIcon.style.cursor = 'pointer';
        searchIcon.addEventListener('click', () => {
            searchInput.focus();
            filterProducts();
        });
    }
}

// Accent Color Theme Customizer
const savedTheme = localStorage.getItem('bluephone-theme') || 'cyan';
document.body.className = savedTheme === 'cyan' ? '' : `theme-${savedTheme}`;

// Sync navbar dots with current theme
document.querySelectorAll('.theme-dot').forEach(dot => {
    if (dot.getAttribute('data-theme') === savedTheme) {
        dot.classList.add('active');
    } else {
        dot.classList.remove('active');
    }

    dot.addEventListener('click', () => {
        const theme = dot.getAttribute('data-theme');
        localStorage.setItem('bluephone-theme', theme);

        // Update body class
        document.body.className = theme === 'cyan' ? '' : `theme-${theme}`;

        // Update active class on all dots across navigation
        document.querySelectorAll('.theme-dot').forEach(td => {
            if (td.getAttribute('data-theme') === theme) {
                td.classList.add('active');
            } else {
                td.classList.remove('active');
            }
        });
    });
});

// Coupon input injection and logic
document.querySelectorAll('.cart-footer').forEach(footer => {
    const couponDiv = document.createElement('div');
    couponDiv.className = 'coupon-container';
    couponDiv.innerHTML = `
        <input type="text" class="coupon-input" placeholder="İndirim Kodu (BLUE2026)">
        <button class="btn-coupon">Uygula</button>
    `;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'discount-message';

    footer.appendChild(couponDiv);
    footer.appendChild(msgDiv);

    const btn = couponDiv.querySelector('.btn-coupon');
    const input = couponDiv.querySelector('.coupon-input');

    btn.addEventListener('click', () => {
        if (input.value.trim().toUpperCase() === 'BLUE2026') {
            discountApplied = true;
            msgDiv.textContent = 'Kupon kodu uygulandı! %10 indirim kazandınız.';
            msgDiv.style.color = '#22c55e';
            msgDiv.style.display = 'block';
            updateCartUI();
        } else {
            discountApplied = false;
            msgDiv.textContent = 'Geçersiz kupon kodu.';
            msgDiv.style.color = '#ff4444';
            msgDiv.style.display = 'block';
            updateCartUI();
        }
    });
});

// ==========================================================================
// Scrollytelling Phone Showcase Animation on Scroll
// ==========================================================================
const showcaseSteps = document.querySelectorAll('.showcase-step');
const phoneMockup = document.querySelector('.phone-mockup-3d');
const screenViews = document.querySelectorAll('.screen-view');

if (showcaseSteps.length > 0 && phoneMockup) {
    const showcaseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const step = entry.target.getAttribute('data-step');
                
                // Clear existing active step classes
                phoneMockup.className = 'phone-mockup-3d';
                
                // Set current step class
                phoneMockup.classList.add(`step-${step}`);
                
                // Handle special camera glow indicator
                if (step === 'camera') {
                    phoneMockup.classList.add('highlight-camera');
                } else {
                    phoneMockup.classList.remove('highlight-camera');
                }
                
                // Set active text style
                showcaseSteps.forEach(s => s.classList.remove('active'));
                entry.target.classList.add('active');
                
                // Set active screen view
                screenViews.forEach(view => {
                    if (view.getAttribute('data-step') === step) {
                        view.classList.add('active');
                    } else {
                        view.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: '-10% 0px -10% 0px'
    });
    
    showcaseSteps.forEach(step => {
        showcaseObserver.observe(step);
    });
}

