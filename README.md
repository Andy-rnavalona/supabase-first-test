Plateforme Immobilière – Test Technique

1️ - Architecture

Backend-first avec Supabase

Authentification (auth.users)

Base PostgreSQL avec Row-Level Security (RLS)

Gestion des rôles agent et client via la table profiles

Frontend : Next.js / React

Page login (/login)

Liste des biens publiés (/)

Page “Mes biens” pour agent (/my-properties)

Script Python : automatisation / statistiques

Flux utilisateur :

Login → redirection selon rôle

Client : accède à tous les biens publiés

Agent : accède à ses biens (y compris drafts), peut créer/éditer ses biens

Script Python : accès aux données via Service Role Key pour calculs statistiques

2 - Modèle de données

profiles :

| Colonne   | Type | Description         |
| --------- | ---- | ------------------- |
| id        | uuid | FK auth.users       |
| role      | text | 'agent' ou 'client' |
| firstname | text | prénom              |
| lastname  | text | nom                 |

properties :

| Colonne      | Type      | Description         |
| ------------ | --------- | ------------------- |
| id           | uuid      | clé primaire        |
| title        | text      | titre du bien       |
| description  | text      | description du bien |
| price        | numeric   | prix                |
| city         | text      | ville               |
| agent_id     | uuid      | FK profiles.id      |
| is_published | boolean   | publié ou draft     |
| created_at   | timestamp | date de création    |

3 - RLS (Row-Level Security)

• À un agent :
1- créer ses biens :
`CREATE policy "Agents can insert own properties"
        on properties
            for insert
                WITH CHECK (
                    auth.uid() = agent_id AND 
                    EXISTS (
                        SELECT 1 FROM profiles 
                        WHERE id = auth.uid() AND role = 'agent'
                    )
                );`
2- modifier ses biens :
`CREATE policy "Agents can update own properties"
        on properties
            for update
               USING (
                    auth.uid() = agent_id AND 
                    EXISTS (
                        SELECT 1 FROM profiles 
                        WHERE id = auth.uid() AND role = 'agent'
                    )
                )`
• À un client :
1 - lire uniquement les biens publiés :

`CREATE policy "Anyone can read published properties"
        on properties
            for select
                using (is_published = true OR auth.uid() = agent_id);`

• À chaque utilisateur :
2 - accéder uniquement à son profil

` CREATE policy "Users can read own profile"
    on profiles
        for select
        using (auth.uid() = id)`;

`CREATE policy "Users can update own profile"
    on profiles
        for update
            using (auth.uid() = id);`

4️ - Script Python (Option C)

Fichier : script/stats.py

Objectif : calculer le nombre de biens et prix moyen par ville

Utilise supabase-py + Service Role Key

lancer le script

python script/stats.py

Variables d’environnement (.env) :

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxx

5 - Améliorations possibles

Pagination et recherche dans la liste des biens

Ajout d’upload d’images pour les propriétés

Filtrage avancé par prix, ville, type de bien

Ajouter des notifications / alertes pour les agents

Implémenter tests automatisés pour le backend et frontend

Ajouter dashboards analytiques pour les administrateurs

---

Raisonnement technique

1️- Pourquoi Supabase est adapté ?

Backend-as-a-Service complet (Auth + PostgreSQL)

Row-Level Security intégré → sécurité au niveau DB

Rapidité de développement sans créer une API custom

Idéal pour un projet backend-first

2 - Où placer la logique métier ?

Frontend → UI / interactions utilisateur

RLS / Database → sécurité et logique critique (propriété, ownership)

Scripts externes (Python) → automatisation, statistiques, export

3 - À quoi servirait Python dans un projet réel ?

Reporting et analyse des données

Nettoyage ou validation de données

Jobs planifiés ou export CSV

Integration avec ML ou dashboards

4 - Limites à grande échelle

RLS complexes → plus difficile à maintenir

Beaucoup de logique métier dans la DB → difficile à tester / déboguer

Large volume de données → nécessite caching / pagination / optimisation

Multi-region ou haute disponibilité → architecture BaaS seule peut ne pas suffire
