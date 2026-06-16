import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    
    private baseUrl = environment.baseUrl;
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    
    private adminAccountsCache$: Observable<any[]> | null = null;
    private companiesByAIDCache = new Map<number, Observable<any[]>>();
    private accountGroupsCache = new Map<number, Observable<any[]>>();
    private accountGroupsParamCache = new Map<string, Observable<any[]>>();

    
    private _cachedAdminAccounts: any[] | null = null;
    private _cachedCompaniesByAID = new Map<number, any[]>();

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        const headers: any = {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return new HttpHeaders(headers);
    }

    

    getDropDownList(table: string, value: string, text: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Common/GetDropDownList?table=${table}&value=${value}&text=${text}`, {
            headers: this.getHeaders()
        });
    }

    getDropDownListWhere(table: string, value: string, text: string, where: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Common/GetDropDownListWhere?table=${table}&value=${value}&text=${text}&where=${where}`, {
            headers: this.getHeaders()
        });
    }

    getEntityDataForXML(cid: number): Observable<string> {
        const token = localStorage.getItem('authToken');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return this.http.get(`${this.baseUrl}/Common/GetEntityDataForXML/${cid}`, {
            headers: new HttpHeaders(headers),
            responseType: 'text'
        });
    }

    getEntityDataForPDFByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Common/GetEntityDataForPDFByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    importEntitiesFromExcel(cid: number, file: File, companyId: string): Observable<any> {
        const token = localStorage.getItem('authToken');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.http.post<any>(
            `${this.baseUrl}/Common/ImportEntitiesFromExcel/${cid}?companyId=${encodeURIComponent(companyId)}`,
            formData,
            { headers: new HttpHeaders(headers) }
        );
    }

    importAssetsFromExcel(cid: number, file: File, companyId: string): Observable<any> {
        const token = localStorage.getItem('authToken');
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.http.post<any>(
            `${this.baseUrl}/Common/ImportAssetsFromExcel/${cid}?companyId=${encodeURIComponent(companyId)}`,
            formData,
            { headers: new HttpHeaders(headers) }
        );
    }

    

    getAccountAndCompany(uid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Account/GetAccountAndCompany/${uid}`, {
            headers: this.getHeaders()
        });
    }

    getAccountAndCompanyByCID(cid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Account/GetAccountAndCompanyByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getAdminAccountCompany(uid: number, cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Account/GetAdminAccountCompany/${uid}/${cid}`, {
            headers: this.getHeaders()
        });
    }

    adminGetAccounts(): Observable<any[]> {
        if (!this.adminAccountsCache$) {
            this.adminAccountsCache$ = this.http.get<any[]>(`${this.baseUrl}/Account/AdminGetAccounts`, {
                headers: this.getHeaders()
            }).pipe(
                tap(data => this._cachedAdminAccounts = data),
                shareReplay(1)
            );
        }
        return this.adminAccountsCache$;
    }

    getAdminAccountsSync(): any[] | null {
        return this._cachedAdminAccounts;
    }

    
    clearAdminAccountsCache(): void {
        this.adminAccountsCache$ = null;
        this._cachedAdminAccounts = null;
    }

    adminDeleteAccount(aid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/Account/AdminDeleteAccount/${aid}`, {
            headers: this.getHeaders()
        }).pipe(tap(() => this.clearAdminAccountsCache()));
    }


    adminGetCompaniesByAID(aid: number): Observable<any[]> {
        if (!this.companiesByAIDCache.has(aid)) {
            const obs = this.http.get<any[]>(`${this.baseUrl}/Company/AdminGetCompaniesByAID/${aid}`, {
                headers: this.getHeaders()
            }).pipe(
                tap(data => this._cachedCompaniesByAID.set(aid, data)),
                shareReplay(1)
            );
            this.companiesByAIDCache.set(aid, obs);
        }
        return this.companiesByAIDCache.get(aid)!;
    }

    getCompaniesByAIDSync(aid: number): any[] | null {
        return this._cachedCompaniesByAID.get(aid) || null;
    }

    clearCompaniesByAIDCache(): void {
        this.companiesByAIDCache.clear();
        this._cachedCompaniesByAID.clear();
        this.accountGroupsCache.clear();
    }

    adminDeleteCompany(cid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/Company/AdminDeleteCompany/${cid}`, {
            headers: this.getHeaders()
        }).pipe(tap(() => {
            this.companiesByAIDCache.clear();
            this.clearAdminAccountsCache(); 
        }));
    }


    getAccountDetailsByCID(cid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Account/GetAccountDetailsByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getAccountDetailsByAID(aid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Account/GetAccountDetailsByAID/${aid}`, {
            headers: this.getHeaders()
        });
    }

    getAccountGroupsByAID(aid: number): Observable<any[]> {
        if (!this.accountGroupsCache.has(aid)) {
            const obs = this.http.get<any[]>(`${this.baseUrl}/Account/GetAccounGroupsByAID/${aid}`, {
                headers: this.getHeaders()
            }).pipe(shareReplay(1));
            this.accountGroupsCache.set(aid, obs);
        }
        return this.accountGroupsCache.get(aid)!;
    }

    getAccountGroupsByAIDWithParams(aid: number, table: string = 'accountgroup', value: string = 'agid', text: string = 'groupname'): Observable<any[]> {
        const where = `where aid=${aid}`;
        const cacheKey = `${aid}_${table}_${value}_${text}`;
        
        if (!this.accountGroupsParamCache.has(cacheKey)) {
            const obs = this.http.get<any[]>(
                `${this.baseUrl}/Common/GetDropDownListWhere?table=${table}&value=${value}&text=${text}&where=${encodeURIComponent(where)}`,
                { headers: this.getHeaders() }
            ).pipe(shareReplay(1));
            this.accountGroupsParamCache.set(cacheKey, obs);
        }
        return this.accountGroupsParamCache.get(cacheKey)!;
    }

    clearAccountGroupsCache(): void {
        this.accountGroupsCache.clear();
        this.accountGroupsParamCache.clear();
    }

    insUpdGroups(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Account/InsUpdGroups`, data, {
            headers: this.getHeaders()
        }).pipe(tap(() => this.clearAccountGroupsCache()));
    }

    deleteAccountGroupByAGID(agid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/Account/DeleteAccounGroupsByAGID/${agid}`, {
            headers: this.getHeaders()
        }).pipe(tap(() => this.clearAccountGroupsCache()));
    }

    createAccount(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Account/CreateAccount`, data, {
            headers: this.getHeaders()
        }).pipe(tap(() => this.clearAdminAccountsCache()));
    }

    updateAccount(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Account/UpdateAccount`, data, {
            headers: this.getHeaders()
        }).pipe(tap(() => this.clearAdminAccountsCache()));
    }

    updateAccountDetails(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Account/UpdateAccountDetails`, data, {
            headers: this.getHeaders()
        });
    }

    

    getAssetByID(assetid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Assets/GetAssetByID/${assetid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdAsset(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Assets/InsUpdAsset`, data, {
            headers: this.getHeaders()
        });
    }

    forwardAssetsToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Assets/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    
    getAssetsListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Assets/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getAssetDataForXML(cid: number, assetIds: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/Assets/GetAssetDataForXML/${cid}?assetids=${assetIds}`, {
            headers: this.getHeaders(),
            responseType: 'text' as 'json'
        });
    }

    deleteAssetByID(assetId: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/Assets/DeleteByID/${assetId}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    

    getCatStatusListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/CatStatus/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    deleteCatStatusByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/CatStatus/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getCatStatusRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/CatStatus/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdCatStatus(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/CatStatus/InsUpdCatStatus`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdCatStatusUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/CatStatus/InsUpdCatStatusUI`, data, {
            headers: this.getHeaders()
        });
    }

    
    insUpdCatStatusUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/CatStatus/InsUpdCatStatusUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    forwardCatStatusToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/CatStatus/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getCompanyListByAID(aid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Company/GetCompanyListByAID/${aid}`, {
            headers: this.getHeaders()
        });
    }

    getCompanyListByCID(cid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Company/GetCompanyListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getCompanyListByUIDAGID(uid: number, agid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Company/GetCompanyListByUIDAGID/${uid}/${agid}`, {
            headers: this.getHeaders()
        });
    }

    getCompanyByID(cid: number | string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Company/GetCompanyDetails/${cid}`, {
            headers: this.getHeaders()
        });
    }

    createCompany(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/Company/CreateCompany`, data, {
            headers: this.getHeaders(),
            responseType: 'text' as 'json'
        }).pipe(tap(() => {
            this.clearCompaniesByAIDCache();
            this.clearAdminAccountsCache(); 
        }));
    }

    copyEntityData(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Company/CopyEntityData`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    updateCompany(data: any, cid: number | string | null = null): Observable<any> {
        const url = cid ? `${this.baseUrl}/Company/UpdateCompany?cid=${cid}` : `${this.baseUrl}/Company/UpdateCompany`;
        return this.http.post<any>(url, data, {
            headers: this.getHeaders()
        }).pipe(tap(() => {
            this.clearCompaniesByAIDCache();
            this.clearAdminAccountsCache();
        }));
    }

    updateCompanyDetails(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Company/UpdateCompanyDetails`, data, {
            headers: this.getHeaders()
        });
    }

    getFilingFlagsByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Company/GetFilingFlagsByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    updateFilingFlags(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Company/UpdateFilingFlags`, data, {
            headers: this.getHeaders()
        });
    }

    
    
    
    updateIncInFilingFlag(cid: number, data: { table: string; tableId: string; value: string; whereIds: string }): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/Common/UpdateIncInFilingFlag/${cid}`, data, {
            headers: this.getHeaders()
        });
    }

    
    
    
    updateIncInFilingFlagAll(cid: number, data: { table: string; tableId: string; value: string }): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/Common/UpdateIncInFilingFlagAll/${cid}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getInvoiceDataByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/GetInvoiceDataByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    adminGetInvoices(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/AdminGetInvoices/${cid}`, {
            headers: this.getHeaders()
        });
    }

    adminChangeAccountForVen(aid: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/AdminChangeAccountForVen/${aid}`, null, {
            headers: this.getHeaders()
        });
    }

    createInvoice(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/CreateInvoice`, data, {
            headers: this.getHeaders()
        });
    }

    updateInvoice(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/UpdateInvoice`, data, {
            headers: this.getHeaders()
        });
    }

    createMonthlyInvoice(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/CreateMonthlyInvoice`, data, {
            headers: this.getHeaders()
        });
    }

    updateMonthlyInvoice(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/UpdateMonthlyInvoice`, data, {
            headers: this.getHeaders()
        });
    }

    updateSentInvoice(invoiceId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/UpdateSentInvoice/${invoiceId}`, {}, {
            headers: this.getHeaders()
        });
    }

    updateFERCStatus(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/UpdateFERCStatus`, data, {
            headers: this.getHeaders()
        });
    }

    adminGetFilingsForInvoices(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/AdminGetFilingsForInvoices/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getAdminGetInvoiceMonthlyCountByCID(aid: number, agid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/GetAdminGetInvoiceMonthlyCountByCID/${aid}/${agid}`, {
            headers: this.getHeaders()
        });
    }

    getInvoiceByID(invoiceId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/GetInvoiceByID/${invoiceId}`, {
            headers: this.getHeaders()
        });
    }

    getAdminGetInvoiceMonthlyByID(invoiceId: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/GetAdminGetInvoiceMonthlyByID/${invoiceId}`, {
            headers: this.getHeaders()
        });
    }

    getFilingsForInvoiceByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Invoice/GetFilingsForInvoiceByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    adminUpdateInvoicesIsBilledByIDs(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/AdminUpdateInvoicesIsBilledByIDs`, data, {
            headers: this.getHeaders()
        });
    }

    forwardInvoiceToExternal(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Invoice/ForwardToExternal`, data, {
            headers: this.getHeaders()
        });
    }

    

    getEntitiesListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Entities/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    deleteEntitiesByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/Entities/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getEntitiesRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Entities/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdEntities(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Entities/InsUpdEntities`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdEntitiesUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Entities/InsUpdEntitiesUI`, data, {
            headers: this.getHeaders()
        });
    }

    forwardEntitiesToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Entities/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getEtoEListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoE/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    deleteEtoEByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/EtoE/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getEtoERecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoE/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoEUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoE/InsUpdEtoEUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoEUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/EtoE/InsUpdEtoEUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    forwardEtoEToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoE/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getEtoGenListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoGen/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    deleteEtoGenByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/EtoGen/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getEtoGenRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoGen/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoGenUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoGen/InsUpdEtoGenUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoGenUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/EtoGen/InsUpdEtoGenUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    forwardEtoGenToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoGen/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getEtoPPAsListByCID(cid: number, showAll: boolean = false): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoPPAs/GetListByCID/${cid}?showAll=${showAll}`, {
            headers: this.getHeaders()
        });
    }

    deleteEtoPPAsByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/EtoPPAs/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getEtoPPAsRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoPPAs/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoPPAsUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoPPAs/InsUpdEtoPPAsUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoPPAsUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/EtoPPAs/InsUpdEtoPPAsUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    forwardEtoPPAsToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoPPAs/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getEtoVAListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoVA/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    deleteEtoVAByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/EtoVA/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getEtoVARecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/EtoVA/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoVAUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoVA/InsUpdEtoVAUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdEtoVAUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/EtoVA/InsUpdEtoVAUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    forwardEtoVAToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/EtoVA/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getIMSSListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/IMSS/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getIMSSParamsListByCIDAndId(cid: number, pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/IMSS/GetParamsListByCIDAndId/${cid}/${pid}`, {
            headers: this.getHeaders()
        });
    }

    deleteIMSSByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/IMSS/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getIMSSRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/IMSS/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdIMSSUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IMSS/InsUpdIMSSUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdIMSSUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/IMSS/InsUpdIMSSUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    insUpdIMSSUICopy(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IMSS/InsUpdIMSSUICopy`, data, {
            headers: this.getHeaders()
        });
    }

    forwardIMSSToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IMSS/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getIPSSListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/IPSS/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getIPSSParamsListByCIDAndId(cid: number, pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/IPSS/GetParamsListByCIDAndId/${cid}/${pid}`, {
            headers: this.getHeaders()
        });
    }

    deleteIPSSByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/IPSS/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getIPSSRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/IPSS/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdIPSSUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IPSS/InsUpdIPSSUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdIPSSUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/IPSS/InsUpdIPSSUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    insUpdIPSSUICopy(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IPSS/InsUpdIPSSUICopy`, data, {
            headers: this.getHeaders()
        });
    }

    forwardIPSSToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IPSS/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    bulkImportIPSSStudy(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/IPSS/BulkImportIPSSStudy`, data, {
            headers: this.getHeaders()
        });
    }

    

    getMBRAuthListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/MBRAuth/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getMBRAuthByID(mbrauthid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/MBRAuth/GetAuthByID/${mbrauthid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdMBRAuthData(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/MBRAuth/InsUpdMBRAuthData`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdMBRAuthDataUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/MBRAuth/InsUpdMBRAuthDataUI`, data, {
            headers: this.getHeaders()
        });
    }

    
    insUpdMBRAuthDataUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/MBRAuth/InsUpdMBRAuthDataUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    deleteMBRAuthByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/MBRAuth/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    forwardMBRAuthToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/MBRAuth/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getFilingListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Filing/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    
    insUpdFiling(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Filing/InsUpdFiling`, data, {
            headers: this.getHeaders()
        });
    }

    getFilingsList(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/Filings/GetFilingsList`, {
            headers: this.getHeaders()
        });
    }

    getFilingByID(fid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Filings/GetFilingByID/${fid}`, {
            headers: this.getHeaders()
        });
    }

    createFiling(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Filings/CreateFiling`, data, {
            headers: this.getHeaders()
        });
    }

    updateFiling(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Filings/UpdateFiling`, data, {
            headers: this.getHeaders()
        });
    }

    pullDataBySub(uid: number, cid: number, company_id: string, subFk: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/FERCAPI/PullDataBySub/${uid}/${cid}/${company_id}/${subFk}`, {
            headers: this.getHeaders()
        });
    }

    pullDataByEntity(uid: number, cid: number, company_id: string, entity: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/FERCAPI/PullDataByEntity/${uid}/${cid}/${company_id}/${entity}`, {
            headers: this.getHeaders()
        });
    }

    

    getMitigationsListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Mitigation/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    deleteMitigationsByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/Mitigation/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    getMitigationsRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/Mitigations/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdMitigations(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Mitigations/InsUpdMitigations`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdMitigationsUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Mitigation/InsUpdMbrMitigUI`, data, {
            headers: this.getHeaders()
        });
    }

    
    insUpdMitigationsUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/Mitigation/InsUpdMbrMitigUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    forwardMitigationsToExternal(url: string, data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Mitigations/ForwardToExternal?url=${url}`, data, {
            headers: this.getHeaders()
        });
    }

    

    getSelfLimitListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/SelfLimit/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getSelfLimitRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/SelfLimit/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdSelfLimitUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/SelfLimit/InsUpdSelfLimitUI`, data, {
            headers: this.getHeaders()
        });
    }

    deleteSelfLimitByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/SelfLimit/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    

    getORListByCID(cid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/OR/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getORRecordByID(pid: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/OR/GetRecordByID/${pid}`, {
            headers: this.getHeaders()
        });
    }

    insUpdORUI(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/OR/InsUpdORUI`, data, {
            headers: this.getHeaders()
        });
    }

    insUpdORUIWithResponse(data: any): Observable<import("@angular/common/http").HttpResponse<any>> {
        return this.http.post<any>(`${this.baseUrl}/OR/InsUpdORUI`, data, {
            headers: this.getHeaders(),
            observe: 'response'
        });
    }

    deleteORByID(pid: number, gid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/OR/DeleteByID/${pid}/${gid}`, {
            headers: this.getHeaders()
        });
    }

    

    
    getUserListByCID(cid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/User/GetListByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getInactiveUsersByCID(cid: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/User/GetInactiveUsersByCID/${cid}`, {
            headers: this.getHeaders()
        });
    }

    getUserByID(uid: number): Observable<any> {
        
        return this.http.get<any>(`${this.baseUrl}/User/GetUserByUID/${uid}`, {
            headers: this.getHeaders()
        });
    }

    createUser(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/User/CreateUser`, data, {
            headers: this.getHeaders()
        });
    }

    updateUser(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/User/UpdateUser`, data, {
            headers: this.getHeaders()
        });
    }

    updateMyProfile(data: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/User/UpdateMyProfile`, data, {
            headers: this.getHeaders()
        });
    }

    deleteUser(uid: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/User/DeleteByID/${uid}`, {
            headers: this.getHeaders()
        });
    }

    updateUserActivateByCID(cid: number, uids: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/User/UpdateUserActivateByCID`, { cid, uiDs: uids }, {
            headers: this.getHeaders()
        });
    }

    deleteUserInActivesByCID(cid: number, uids: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/User/DeleteUserInActivesByCID`, { cid, uiDs: uids }, {
            headers: this.getHeaders()
        });
    }

    getUserRoleTypes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/User/GetUserRoleTypes`, {
            headers: this.getHeaders()
        });
    }

    adminGetUserRoleTypes(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/User/AdminGetUserRoleTypes`, {
            headers: this.getHeaders()
        });
    }

    

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Login/GetLogin`, { email, password });
    }

    logout(): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Login/Logout`, {}, {
            headers: this.getHeaders()
        });
    }

    refreshToken(token: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/Login/RefreshToken`, { token });
    }
}
