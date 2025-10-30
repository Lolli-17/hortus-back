import requests
import json

# ==============================================================================
# 1. CONFIGURAZIONE
# La tua API Key (la stessa di prima)
# ==============================================================================
API_KEY = "jdbmc04C1MT7L4l7gk70CVlUxfXAlwnY"


def get_top_stories(section='world'):
    """
    Interroga l'API NYT Top Stories per una sezione specifica.

    Args:
        section (str): La sezione di notizie (es. 'world', 'us', 'science', 'home').
    """
    
    # Non c'è più bisogno del controllo sulla chiave,
    # quindi l'ho rimosso.

    # 3. Costruzione dell'URL e dei parametri
    # !!! QUESTA È LA PARTE CHE CAMBIA !!!
    base_url = "https://api.nytimes.com/svc/topstories/v2"
    # La sezione (es. 'world') ora fa parte dell'URL
    url = f"{base_url}/{section}.json"
    
    # L'API key è sempre un parametro 'query'
    params = {'api-key': API_KEY}

    print(f"Sto contattando l'API Top Stories (sezione {section}): {url}...")

    try:
        # 4. Esecuzione della richiesta
        response = requests.get(url, params=params)

        # 5. Gestione della risposta
        if response.status_code == 200:
            print("Richiesta riuscita! (Status 200)")
            return response.json()
        
        elif response.status_code == 401:
            print("Errore 401: Unauthorized. Controlla che il tuo API Key sia corretto.")
            return None
        
        elif response.status_code == 429:
            print("Errore 429: Too Many Requests. Hai superato il limite di richieste.")
            return None
            
        else:
            print(f"Errore {response.status_code}: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"Errore di connessione all'API: {e}")
        return None

# ==============================================================================
# 6. ESEMPIO DI UTILIZZO
# ==============================================================================
if __name__ == "__main__":
    
    # Esempio: Ottieni le TOP STORIES della sezione 'world'
    news_data = get_top_stories(section='world') 
    
    # Puoi provare anche altre sezioni, ad esempio:
    # news_data = get_top_stories(section='science')
    # news_data = get_top_stories(section='sports')
    
    if news_data:
        # 'news_data' è ora un dizionario Python
        
        print("\n--- DATI JSON RICEVUTI (output formattato) ---")
        print(json.dumps(news_data, indent=2))
        
        print("\n--- ESEMPIO: Elenco dei Titoli 'World' ---")
        
        # Estraiamo solo i titoli
        # Nota: La struttura di "Top Stories" è molto simile a "Most Popular"
        articles = news_data.get('results', [])
        
        if articles:
            for i, article in enumerate(articles):
                print(f"{i+1}. {article.get('abstract')}")
        else:
            print("Nessun articolo trovato nei risultati.")