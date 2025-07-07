# EV Akcesoria - Sklep z akcesoriami dla pojazdów elektrycznych

Nowoczesna aplikacja sklepu internetowego dedykowana akcesoriom dla pojazdów elektrycznych, zbudowana w React z Firebase jako backend.

## 🚀 Funkcjonalności

- **Katalog produktów** - Przeglądanie i filtrowanie produktów
- **System koszyka** - Dodawanie, usuwanie i modyfikacja produktów
- **Proces zakupu** - Kompletny checkout z formularzem
- **Recenzje produktów** - System opinii użytkowników
- **Logowanie/Rejestracja** - Zarządzanie kontami użytkowników
- **Panel administratora** - Zarządzanie produktami i zamówieniami
- **Responsywny design** - Optymalizacja na wszystkie urządzenia

## 🛠️ Technologie

- **Frontend**: React 19, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Ikony**: Lucide React
- **Stylizacja**: Tailwind CSS z ciemnym motywem

## 📦 Instalacja

1. **Sklonuj repozytorium:**
```bash
git clone <repository-url>
cd ev-shop
```

2. **Zainstaluj zależności:**
```bash
npm install
```

3. **Konfiguracja Firebase:**
   - Utwórz projekt w [Firebase Console](https://console.firebase.google.com/)
   - Włącz Authentication (Email/Password)
   - Utwórz bazę danych Firestore
   - Włącz Storage
   - Skopiuj konfigurację Firebase do `src/App.js`

4. **Konfiguracja reguł Firestore:**
```javascript
// Wklej te reguły w Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Produkty - wszyscy mogą czytać, tylko admini mogą pisać
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
      
      // Recenzje produktów
      match /reviews/{reviewId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Zamówienia - tylko właściciel lub admin może czytać/pisać
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.role == 'admin');
    }
  }
}
```

5. **Konfiguracja uprawnień administratora:**
```javascript
// W Firebase Console > Authentication > Users
// Znajdź użytkownika i dodaj Custom Claims:
{
  "role": "admin"
}
```

## 🚀 Uruchomienie

```bash
npm start
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## 📁 Struktura projektu

```
src/
├── App.js          # Główny komponent aplikacji
├── index.js        # Punkt wejścia
├── index.css       # Style globalne (Tailwind)
public/
├── index.html      # Szablon HTML
├── manifest.json   # Manifest PWA
└── robots.txt      # Konfiguracja SEO
```

## 🔧 Konfiguracja

### Firebase Setup
1. Utwórz projekt Firebase
2. Włącz Authentication (Email/Password)
3. Utwórz bazę Firestore
4. Włącz Storage
5. Skopiuj konfigurację do `src/App.js`

### Dodawanie produktów
1. Zaloguj się jako administrator
2. Przejdź do Panel Administratora
3. Dodaj produkty z obrazkami
4. Ustaw kategorie i ceny

### Testowanie
- Utwórz konto użytkownika
- Dodaj produkty do koszyka
- Przejdź przez proces zakupu
- Dodaj recenzje produktów

## 🎨 Dostosowanie

### Kolory i style
Modyfikuj `tailwind.config.js` i `src/index.css` aby dostosować wygląd.

### Dodawanie nowych funkcji
Główna logika aplikacji znajduje się w `src/App.js`. Dodaj nowe komponenty i funkcjonalności według potrzeb.

## 📱 PWA Support

Aplikacja jest gotowa jako Progressive Web App z:
- Manifest.json
- Service Worker (przez React)
- Responsywny design

## 🔒 Bezpieczeństwo

- Uwierzytelnianie przez Firebase Auth
- Reguły bezpieczeństwa Firestore
- Walidacja danych po stronie frontendu i backendu

## 📋 Todo

- [ ] Integracja z systemem płatności (Stripe/PayPal)
- [ ] Powiadomienia email
- [ ] Śledzenie zamówień
- [ ] Wishlist użytkownika
- [ ] Porównywanie produktów
- [ ] Chat na żywo

## 🤝 Wsparcie

W przypadku problemów z konfiguracją:
1. Sprawdź reguły Firestore
2. Upewnij się, że Firebase Auth jest włączony
3. Sprawdź uprawnienia administratora
4. Skontaktuj się z zespołem deweloperskim

## 📄 Licencja

Ten projekt jest licencjonowany pod licencją MIT.

---

**EV Akcesoria** - Napędzamy przyszłość elektromobilności! ⚡🚗