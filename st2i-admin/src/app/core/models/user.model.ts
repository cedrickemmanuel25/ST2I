export interface User {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: 'admin' | 'employé' | 'étudiant';
    statut: 'actif' | 'inactif';
    date_creation: string;
    qr_code_expiry?: string;
    last_presence?: string;
}

export interface UserListResponse {
    total: number;
    page: number;
    limit: number;
    users: User[];
}
