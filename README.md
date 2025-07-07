# 🚗⚡ EV Akcesoria - Sklep z Akcesoriami do Samochodów Elektrycznych

Nowoczesny sklep internetowy z akcesoriami dla pojazdów elektrycznych zbudowany w React.js z Firebase.

![EV Akcesoria](https://img.shields.io/badge/React-18.2.0-blue) ![Firebase](https://img.shields.io/badge/Firebase-9.x-orange) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-cyan)

## ✨ Funkcjonalności

### 🏪 Funkcje sklepu
- **Przeglądanie produktów** z filtrowaniem i sortowaniem
- **Koszyk zakupów** z możliwością modyfikacji ilości
- **System płatności** z formularzem checkout
- **Kategorie produktów** (Ładowarki, Adaptery, Akcesoria, Baterie)
- **Oceny i recenzje** produktów
- **Responsywny design** dla wszystkich urządzeń

### 🔥 Animacje i UI/UX
- **Płynne animacje** fade-in, slide-in, zoom, bounce
- **Glass effect** na kartach i modałach
- **Gradient backgrounds** z animowanymi cząsteczkami
- **Hover effects** z glowing buttons
- **Interaktywne karty produktów** z efektami 3D
- **Custom scrollbar** i smooth scrolling

### 👤 System użytkowników
- **Rejestracja i logowanie** przez Firebase Auth
- **Panel użytkownika** z historią zamówień
- **Role administratora** z pełnym panelem zarządzania

### 🛡️ Panel Administratora
- **Dashboard** ze statystykami sprzedaży
- **Zarządzanie produktami** (dodawanie, edycja, usuwanie)
- **Upload zdjęć** do Firebase Storage
- **Zarządzanie zamówieniami** ze zmienianiem statusów
- **Analytics** sprzedaży i produktów

## 🚀 Szybki Start

### Wymagania
- Node.js 14+ 
- npm 6+
- Git

### Instalacja

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/Acoste616/EVsite.git
cd EVsite

# 2. Przełącz na najnowszą branch z poprawkami
git checkout cursor/fix-module-parse-error-in-index-js-638a

# 3. Zainstaluj zależności
npm install

# 4. Uruchom aplikację
npm start
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## 🔑 Dostęp Administratora

### Dane logowania admina:
```
Email: bartoszdomanski55@gmail.com
Hasło: Admin123
```

### Funkcje administratora:
1. **Dashboard** - statystyki sprzedaży i przegląd
2. **Produkty** - dodawanie, edycja, usuwanie produktów
3. **Zamówienia** - zarządzanie statusami zamówień
4. **Upload** - dodawanie zdjęć produktów

Dostęp do panelu: Zaloguj się → Ikona użytkownika → "Panel Admina"

## 🛠️ Dostępne Komendy

```bash
npm start          # Uruchomienie serwera deweloperskiego
npm run build      # Budowanie wersji produkcyjnej  
npm test          # Uruchomienie testów
npm run eject     # Eksport konfiguracji (nieodwracalne!)
```

## 🎨 Technologie

### Frontend
- **React 19.1.0** - biblioteka UI
- **Tailwind CSS 3.4.0** - framework CSS
- **Lucide React** - ikony
- **Custom CSS Animations** - animacje

### Backend & Services  
- **Firebase Auth** - autentykacja użytkowników
- **Firestore** - baza danych NoSQL
- **Firebase Storage** - przechowywanie plików
- **Firebase Hosting** - hosting aplikacji

### Development Tools
- **React Scripts** - narzędzia deweloperskie
- **PostCSS** - preprocessing CSS
- **Autoprefixer** - kompatybilność CSS

## 📱 Responsywność

Aplikacja jest w pełni responsywna i dostosowana do:
- 📱 **Mobile** (320px+)
- 📟 **Tablet** (768px+)  
- 💻 **Desktop** (1024px+)
- 🖥️ **Large screens** (1440px+)

## 🔧 Konfiguracja Firebase

Firebase jest już skonfigurowany, ale jeśli chcesz użyć własnego projektu:

1. Stwórz projekt w [Firebase Console](https://console.firebase.google.com)
2. Włącz Authentication, Firestore i Storage
3. Skopiuj konfigurację do `src/App.js`
4. Ustaw reguły bezpieczeństwa Firestore

## 🏗️ Struktura Projektu

```
src/
├── App.js              # Główny komponent aplikacji
├── index.js            # Punkt wejścia React
├── index.css           # Style globalne z animacjami
└── ...

public/
├── index.html          # Główny plik HTML
└── ...
```

## 🐛 Rozwiązywanie Problemów

### Problem z modułami ES6
✅ **Rozwiązane** - usunięto `"type": "commonjs"` z `package.json`

### Problem z Firebase
✅ **Rozwiązane** - dodano wszystkie wymagane zależności

### Problem z Tailwind CSS
✅ **Rozwiązane** - użyto kompatybilnej wersji 3.x

### Problem z brakiem animacji
✅ **Rozwiązane** - dodano custom CSS animations

## 📈 Kolejne Kroki

- [ ] Dodanie systemu płatności (Stripe/PayPal)
- [ ] Implementacja systemu newslettera
- [ ] Dodanie chat bota
- [ ] Rozszerzenie panelu analytics
- [ ] Dodanie API dla aplikacji mobilnej

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź czy wszystkie zależności są zainstalowane
2. Upewnij się że używasz Node.js 14+
3. Sprawdź czy Firebase jest poprawnie skonfigurowany
4. Sprawdź logi w konsoli przeglądarki

## 📄 Licencja

Projekt jest dostępny na licencji MIT.

---

**Napędzamy przyszłość elektromobilności! ⚡🚗**