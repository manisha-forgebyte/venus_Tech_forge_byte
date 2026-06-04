import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';

type AnyRecord = Record<string, any>;

const fallbackRoles = [
  { gid: 1, id: 1, rolename: 'Site Admin', name: 'Site Admin' },
  { gid: 2, id: 2, rolename: 'Account Admin', name: 'Account Admin' },
  { gid: 3, id: 3, rolename: 'Company User', name: 'Company User' },
  { gid: 4, id: 4, rolename: 'Read Only User', name: 'Read Only User' },
];

const areaToModel: Record<string, string> = {
  assets: 'asset',
  asset: 'asset',
  catstatus: 'categoryStatus',
  etoe: 'entityToEntity',
  etogen: 'entityToGeneratorAsset',
  etoppas: 'entityToPpa',
  etova: 'entityToVerticalAsset',
  imss: 'indicativeMarketScreenStudy',
  ipss: 'indicativePowerSupplyStudy',
  mbrauth: 'mbrAuthorization',
  mitigation: 'mitigation',
  mitigations: 'mitigation',
  selflimit: 'selfLimitation',
  selflimitation: 'selfLimitation',
  or: 'operatingReserve',
  fercapi: 'commonLookup',
};

@Controller('api')
export class CompatibilityController {
  private readonly userProfileExtras = new Map<number, AnyRecord>();

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'venu-tech-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get([':area/:action', ':area/:action/:p1', ':area/:action/:p1/:p2', ':area/:action/:p1/:p2/:p3', ':area/:action/:p1/:p2/:p3/:p4'])
  async get(@Param() params: AnyRecord, @Query() query: AnyRecord) {
    const area = this.normalize(params.area);
    const action = this.normalize(params.action);

    if (area === 'common') return this.handleCommonGet(action, params, query);
    if (area === 'account') return this.handleAccountGet(action, params);
    if (area === 'company') return this.handleCompanyGet(action, params);
    if (area === 'user') return this.handleUserGet(action, params);
    if (area === 'filing' || area === 'filings') return this.handleFilingGet(action, params);
    if (area === 'invoice') return this.handleInvoiceGet(action, params);
    if (area === 'assets' || area === 'asset') return this.handleGenericGet('asset', action, params, query);
    if (area === 'catstatus') return this.handleGenericGet('categoryStatus', action, params, query);
    if (area === 'etoe') return this.handleGenericGet('entityToEntity', action, params, query);
    if (area === 'etogen') return this.handleGenericGet('entityToGeneratorAsset', action, params, query);
    if (area === 'etoppas') return this.handleGenericGet('entityToPpa', action, params, query);
    if (area === 'etova') return this.handleGenericGet('entityToVerticalAsset', action, params, query);
    if (area === 'imss') return this.handleImssGet(action, params);
    if (area === 'ipss') return this.handleIpssGet(action, params);
    if (area === 'mbrauth') return this.handleGenericGet('mbrAuthorization', action, params, query);
    if (area === 'mitigation' || area === 'mitigations') return this.handleGenericGet('mitigation', action, params, query);
    if (area === 'selflimit' || area === 'selflimitation') return this.handleGenericGet('selfLimitation', action, params, query);
    if (area === 'or') return this.handleGenericGet('operatingReserve', action, params, query);
    if (area === 'fercapi') return this.handleFercApiGet(action, params);

    if (this.isXmlAction(action)) return '<root></root>';
    if (this.isListAction(action)) return [];
    return {};
  }

  @Post([':area/:action', ':area/:action/:p1'])
  @UseInterceptors(AnyFilesInterceptor())
  @HttpCode(200)
  async post(
    @Param() params: AnyRecord,
    @Body() body: AnyRecord,
    @Query() query: AnyRecord,
    @UploadedFiles() files: any[] = [],
  ) {
    const area = this.normalize(params.area);
    const action = this.normalize(params.action);

    if (area === 'login' && action === 'getlogin') return this.authService.login(body as any);
    if (area === 'login' && action === 'refreshtoken') return this.authService.refreshToken(body as any);
    if (area === 'login' && action === 'logout') return this.authService.logout();

    if (area === 'common') return this.handleCommonPost(action, params, body, query, files);
    if (area === 'user') return this.handleUserPost(action, body, params, query);
    if (area === 'account') return this.handleAccountPost(action, body, params, query);
    if (area === 'company') return this.handleCompanyPost(action, body, params, query);
    if (area === 'filing' || area === 'filings') return this.handleFilingPost(action, body, params, query);
    if (area === 'invoice') return this.handleInvoicePost(action, body, params, query);
    if (area === 'assets' || area === 'asset') return this.handleGenericPost('asset', action, body, params, query);
    if (area === 'catstatus') return this.handleGenericPost('categoryStatus', action, body, params, query);
    if (area === 'etoe') return this.handleGenericPost('entityToEntity', action, body, params, query);
    if (area === 'etogen') return this.handleGenericPost('entityToGeneratorAsset', action, body, params, query);
    if (area === 'etoppas') return this.handleGenericPost('entityToPpa', action, body, params, query);
    if (area === 'etova') return this.handleGenericPost('entityToVerticalAsset', action, body, params, query);
    if (area === 'imss') return this.handleImssPost(action, body, params, query);
    if (area === 'ipss') return this.handleIpssPost(action, body, params, query);
    if (area === 'mbrauth') return this.handleGenericPost('mbrAuthorization', action, body, params, query);
    if (area === 'mitigation' || area === 'mitigations') return this.handleGenericPost('mitigation', action, body, params, query);
    if (area === 'selflimit' || area === 'selflimitation') return this.handleGenericPost('selfLimitation', action, body, params, query);
    if (area === 'or') return this.handleGenericPost('operatingReserve', action, body, params, query);
    if (area === 'fercapi') return this.handleFercApiPost(action, body, params, query);

    return {
      success: false,
      message: `Unsupported action: ${params.area}/${params.action}`,
      data: body ?? {},
    };
  }

  @Put([':area/:action', ':area/:action/:p1'])
  @HttpCode(200)
  async put(@Param() params: AnyRecord, @Body() body: AnyRecord, @Query() query: AnyRecord) {
    const area = this.normalize(params.area);
    const action = this.normalize(params.action);

    if (area === 'common' && action === 'updateincinfilingflag') {
      return this.updateIncInFilingFlag(body, params, query, false);
    }

    if (area === 'common' && action === 'updateincinfilingflagall') {
      return this.updateIncInFilingFlag(body, params, query, true);
    }

    if (area === 'user') return this.handleUserPost(action, body, params, query);
    if (area === 'account') return this.handleAccountPost(action, body, params, query);
    if (area === 'company') return this.handleCompanyPost(action, body, params, query);
    if (area === 'filing' || area === 'filings') return this.handleFilingPost(action, body, params, query);
    if (area === 'invoice') return this.handleInvoicePost(action, body, params, query);
    if (area === 'assets' || area === 'asset') return this.handleGenericPost('asset', action, body, params, query);
    if (area === 'catstatus') return this.handleGenericPost('categoryStatus', action, body, params, query);
    if (area === 'etoe') return this.handleGenericPost('entityToEntity', action, body, params, query);
    if (area === 'etogen') return this.handleGenericPost('entityToGeneratorAsset', action, body, params, query);
    if (area === 'etoppas') return this.handleGenericPost('entityToPpa', action, body, params, query);
    if (area === 'etova') return this.handleGenericPost('entityToVerticalAsset', action, body, params, query);
    if (area === 'imss') return this.handleImssPost(action, body, params, query);
    if (area === 'ipss') return this.handleIpssPost(action, body, params, query);
    if (area === 'mbrauth') return this.handleGenericPost('mbrAuthorization', action, body, params, query);
    if (area === 'mitigation' || area === 'mitigations') return this.handleGenericPost('mitigation', action, body, params, query);
    if (area === 'selflimit' || area === 'selflimitation') return this.handleGenericPost('selfLimitation', action, body, params, query);
    if (area === 'or') return this.handleGenericPost('operatingReserve', action, body, params, query);
    if (area === 'fercapi') return this.handleFercApiPost(action, body, params, query);

    return {
      success: false,
      message: `Unsupported action: ${params.area}/${params.action}`,
      data: body ?? {},
    };
  }

  @Delete([':area/:action/:p1', ':area/:action/:p1/:p2'])
  @HttpCode(200)
  async delete(@Param() params: AnyRecord) {
    const area = this.normalize(params.area);
    const action = this.normalize(params.action);

    if (area === 'user' && action === 'deletebyid') {
      await this.prisma.user.updateMany({
        where: { uid: this.numberValue(params.p1) },
        data: { isActive: false },
      });
    }

    if (area === 'company' && action === 'admindeletecompany') {
      await this.prisma.company.updateMany({
        where: { cid: this.numberValue(params.p1) },
        data: { isActive: false },
      });
    }

    if (area === 'account' && action === 'admindeleteaccount') {
      await this.prisma.account.updateMany({
        where: { aid: this.numberValue(params.p1) },
        data: { isActive: false },
      });
    }

    if (area === 'account' && (action === 'deleteaccoungroupsbyagid' || action === 'deleteaccountgroupsbyagid')) {
      await this.prisma.accountGroup.updateMany({
        where: { agid: this.numberValue(params.p1) },
        data: { isActive: false },
      });

      return {
        success: true,
        message: 'Account group deleted successfully',
      };
    }

    const modelName = areaToModel[area];
    if (modelName && modelName !== 'commonLookup') {
      const deleteResult = await this.deleteGeneric(modelName, params);
      if (deleteResult) {
        return deleteResult;
      }
    }

    return {
      success: true,
      message: 'Deleted successfully',
    };
  }

  private async handleCommonGet(action: string, params: AnyRecord, query: AnyRecord) {
    if (action === 'getentitydataforxml') {
      const cid = this.numberValue(params.p1 || query.cid);
      const records = await this.listModelRecords('entity', { cid });
      return this.buildXmlPayload(cid, records);
    }

    if (this.isXmlAction(action)) return this.buildXmlPayload(this.numberValue(params.p1 || query.cid));

    if (action === 'getdropdownlist' || action === 'getdropdownlistwhere') {
      return this.getDropdownList(
        this.stringValue(query.table || ''),
        this.stringValue(query.value || ''),
        this.stringValue(query.text || ''),
        this.stringValue(query.where || ''),
        query,
      );
    }

    const table = this.normalize(query.table || '');
    if (table.includes('role')) return this.getRoleTypes();
    if (table.includes('accountgroup')) {
      const where = this.stringValue(query.where || '');
      const aidMatch = where.match(/aid\s*=\s*(\d+)/i);
      const aid = this.numberValue(query.aid || params.p1 || aidMatch?.[1]);
      return this.listAccountGroups(aid);
    }
    if (table.includes('account')) return this.listAccounts();
    if (table.includes('company')) return this.listCompanies({ activeOnly: true });
    if (table.includes('commonlookup')) {
      const lookupTable = this.stringValue(query.lookupTable || query.table || '');
      return this.prisma.commonLookup.findMany({
        where: {
          ...(lookupTable ? { table: lookupTable } : {}),
          ...(query.aid ? { aid: this.numberValue(query.aid) } : {}),
          ...(query.cid ? { cid: this.numberValue(query.cid) } : {}),
          isActive: query.isActive === undefined ? true : this.booleanValue(query.isActive, true),
        },
        orderBy: { sortOrder: 'asc' },
      });
    }
    if (action === 'getentitydataforpdfbycid') return this.buildPdfPayload(this.numberValue(params.p1 || query.cid));

    return [];
  }

  private async handleCommonPost(action: string, params: AnyRecord, body: AnyRecord, query: AnyRecord, files: any[] = []) {
    if (action === 'importentitiesfromexcel' || action === 'importassetsfromexcel') {
      return this.importEntityWorkbook(action, params, body, query, files);
    }

    if (action === 'copyentitydata') {
      return this.copyEntityData(body);
    }

    return { success: false, message: `Unsupported common action: ${action}`, data: body ?? {} };
  }

  private async importEntityWorkbook(action: string, params: AnyRecord, body: AnyRecord, query: AnyRecord, files: any[] = []) {
    const cid = this.numberValue(params.p1 || query.cid || body?.cid || body?.Cid);
    if (!cid) {
      return { success: false, message: 'CID is required for import', counts: {}, errors: ['Missing company id'] };
    }

    const parseResult = this.extractImportRows(body, files);
    if (parseResult.errors.length) {
      return {
        success: false,
        message: 'Import file could not be processed',
        cid,
        counts: {},
        errors: parseResult.errors,
      };
    }

    const defaultModel = action === 'importassetsfromexcel' ? 'asset' : 'entity';
    const counts: Record<string, number> = {};
    const errors: string[] = [];

    for (const [index, row] of parseResult.rows.entries()) {
      const modelName = this.importModelForRow(row, defaultModel);
      if (!modelName) {
        errors.push(`Row ${index + 1}: unsupported module/table "${row.module || row.table || row.screen || ''}"`);
        continue;
      }

      try {
        await this.saveImportedRow(modelName, { ...row, cid });
        counts[modelName] = (counts[modelName] || 0) + 1;
      } catch (error: any) {
        errors.push(`Row ${index + 1}: ${error?.message || 'save failed'}`);
      }
    }

    return {
      success: errors.length === 0,
      message: errors.length ? 'Import completed with errors' : 'Import completed successfully',
      cid,
      totalRows: parseResult.rows.length,
      counts,
      errors,
    };
  }

  private extractImportRows(body: AnyRecord, files: any[] = []) {
    const rows: AnyRecord[] = [];
    const errors: string[] = [];
    const bodyRows = body?.records || body?.rows || body?.items || body?.data;

    if (Array.isArray(bodyRows)) {
      rows.push(...bodyRows.map((row) => this.toRecord(row)));
    } else if (typeof bodyRows === 'string') {
      rows.push(...this.parseImportText(bodyRows, errors));
    } else if (body && Object.keys(body).some((key) => !['cid', 'Cid', 'companyId'].includes(key))) {
      rows.push(this.toRecord(body));
    }

    for (const file of files || []) {
      const filename = String(file?.originalname || file?.filename || '').toLowerCase();
      const buffer: Buffer | undefined = file?.buffer;
      if (!buffer?.length) continue;

      if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        errors.push(`${file.originalname || 'Excel file'} is a binary Excel file. Install an XLSX parser or submit CSV/JSON rows for server import.`);
        continue;
      }

      rows.push(...this.parseImportText(buffer.toString('utf8'), errors));
    }

    if (!rows.length && !errors.length) {
      errors.push('No import rows were provided');
    }

    return { rows, errors };
  }

  private parseImportText(text: string, errors: string[]) {
    const trimmed = (text || '').trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((row) => this.toRecord(row));
      if (Array.isArray(parsed?.rows)) return parsed.rows.map((row: unknown) => this.toRecord(row));
      if (Array.isArray(parsed?.records)) return parsed.records.map((row: unknown) => this.toRecord(row));
      return [this.toRecord(parsed)];
    } catch {
      // Fall through to CSV parsing.
    }

    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      errors.push('Import text must be JSON or CSV with a header row');
      return [];
    }

    const headers = this.parseCsvLine(lines[0]).map((header) => header.trim());
    return lines.slice(1).map((line) => {
      const values = this.parseCsvLine(line);
      return headers.reduce((record: AnyRecord, header, index) => {
        record[header] = values[index] ?? '';
        return record;
      }, {});
    });
  }

  private parseCsvLine(line: string) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  }

  private importModelForRow(row: AnyRecord, defaultModel: string) {
    const key = this.normalize(row.module || row.table || row.screen || row.type || defaultModel).replace(/[^a-z0-9]/g, '');
    const mapping: Record<string, string> = {
      asset: 'asset',
      assets: 'asset',
      entity: 'entity',
      entities: 'entity',
      mbrauth: 'mbrAuthorization',
      mbrauthorization: 'mbrAuthorization',
      mbrauthorizations: 'mbrAuthorization',
      authorization: 'mbrAuthorization',
      authorizations: 'mbrAuthorization',
      catstatus: 'categoryStatus',
      categorystatus: 'categoryStatus',
      mitigation: 'mitigation',
      mitigations: 'mitigation',
      selflimit: 'selfLimitation',
      selflimitation: 'selfLimitation',
      selflimitations: 'selfLimitation',
      or: 'operatingReserve',
      operatingreserve: 'operatingReserve',
      operatingreserves: 'operatingReserve',
      etoe: 'entityToEntity',
      entitytoentity: 'entityToEntity',
      entitiestoentities: 'entityToEntity',
      etogen: 'entityToGeneratorAsset',
      entitytogeneratorasset: 'entityToGeneratorAsset',
      entitiestogeneratorassets: 'entityToGeneratorAsset',
      etoppa: 'entityToPpa',
      etoppas: 'entityToPpa',
      entitytoppa: 'entityToPpa',
      entitiestoppas: 'entityToPpa',
      etova: 'entityToVerticalAsset',
      entitytoverticalasset: 'entityToVerticalAsset',
      entitiestoverticalassets: 'entityToVerticalAsset',
      imss: 'indicativeMarketScreenStudy',
      indicativemss: 'indicativeMarketScreenStudy',
      indicativemarketscreenstudy: 'indicativeMarketScreenStudy',
      ipss: 'indicativePowerSupplyStudy',
      indicativepss: 'indicativePowerSupplyStudy',
      indicativepowersupplystudy: 'indicativePowerSupplyStudy',
    };
    return mapping[key] || '';
  }

  private async saveImportedRow(modelName: string, row: AnyRecord) {
    const payload: AnyRecord = { ...row, isActive: row.isActive === undefined ? true : row.isActive };
    delete payload.module;
    delete payload.table;
    delete payload.screen;
    return this.saveModelRecord(modelName, payload, {}, {});
  }

  private async getDropdownList(table: string, valueField: string, textField: string, where: string, query: AnyRecord) {
    const tableName = this.normalize(table);
    const resolvedValueField = valueField || 'value';
    const resolvedTextField = textField || 'text';
    const isActiveFilter = this.extractBooleanWhere(where, 'isActive');
    const aidFilter = this.extractNumberWhere(where, 'aid', query.aid);
    const cidFilter = this.extractNumberWhere(where, 'cid', query.cid);

    if (!tableName) return [];

    if (tableName.includes('role')) {
      const roles = await this.prisma.role.findMany({
        where: { ...(isActiveFilter === undefined ? { isActive: true } : { isActive: isActiveFilter }) },
        orderBy: { gid: 'asc' },
      });
      return roles.map((role) => this.projectDropdownRecord(role, 'role', resolvedValueField, resolvedTextField));
    }

    if (tableName.includes('accountgroup')) {
      const groups = await this.prisma.accountGroup.findMany({
        where: {
          ...(aidFilter ? { aid: aidFilter } : {}),
          ...(isActiveFilter === undefined ? { isActive: true } : { isActive: isActiveFilter }),
        },
        orderBy: { agid: 'asc' },
      });
      return groups.map((group) => this.projectDropdownRecord(group, 'accountGroup', resolvedValueField, resolvedTextField));
    }

    if (tableName.includes('account')) {
      const accounts = await this.prisma.account.findMany({
        where: { ...(isActiveFilter === undefined ? { isActive: true } : { isActive: isActiveFilter }) },
        orderBy: { aid: 'asc' },
      });
      return accounts.map((account) => this.projectDropdownRecord(account, 'account', resolvedValueField, resolvedTextField));
    }

    if (tableName.includes('company')) {
      const companies = await this.prisma.company.findMany({
        where: {
          ...(aidFilter ? { aid: aidFilter } : {}),
          ...(cidFilter ? { cid: cidFilter } : {}),
          ...(isActiveFilter === undefined ? { isActive: true } : { isActive: isActiveFilter }),
        },
        orderBy: { cid: 'asc' },
      });
      return companies.map((company) => this.projectDropdownRecord(company, 'company', resolvedValueField, resolvedTextField));
    }

    if (tableName.includes('commonlookup')) {
      const lookupTable = this.stringValue(query.lookupTable || query.table || table);
      const lookups = await this.prisma.commonLookup.findMany({
        where: {
          ...(lookupTable ? { table: lookupTable } : {}),
          ...(aidFilter ? { aid: aidFilter } : {}),
          ...(cidFilter ? { cid: cidFilter } : {}),
          ...(isActiveFilter === undefined ? { isActive: true } : { isActive: isActiveFilter }),
        },
        orderBy: { sortOrder: 'asc' },
      });
      return lookups.map((lookup) => this.projectDropdownRecord(lookup, 'commonLookup', resolvedValueField, resolvedTextField));
    }

    if (tableName.includes('lookbaa') || tableName.includes('balancingauthority') || tableName.includes('balancing_authority')) {
      return this.getBalancingAuthorityDropdown(resolvedValueField, resolvedTextField);
    }

    const modelName = this.dropdownModelForTable(tableName);
    if (!modelName) return [];

    const client = (this.prisma as AnyRecord)[modelName];
    if (!client?.findMany) return [];

    const records = await client.findMany({
      where: this.buildDropdownWhere(modelName, { aid: aidFilter, cid: cidFilter, isActive: isActiveFilter }),
      orderBy: this.orderByForModel(modelName),
    });
    return records.map((record: AnyRecord) => this.projectDropdownRecord(record, modelName, resolvedValueField, resolvedTextField));
  }

  private dropdownModelForTable(tableName: string) {
    switch (tableName) {
      case 'asset':
      case 'assets':
        return 'asset';
      case 'entity':
      case 'entities':
        return 'entity';
      case 'filing':
      case 'filings':
        return 'filing';
      case 'invoice':
        return 'invoice';
      case 'monthlyinvoice':
        return 'monthlyInvoice';
      case 'categorystatus':
        return 'categoryStatus';
      case 'entitytoentity':
        return 'entityToEntity';
      case 'entitytogeneratorasset':
        return 'entityToGeneratorAsset';
      case 'entitytoppa':
        return 'entityToPpa';
      case 'entitytoverticalasset':
        return 'entityToVerticalAsset';
      case 'indicativemarketscreenstudy':
        return 'indicativeMarketScreenStudy';
      case 'imssparameter':
        return 'imssParameter';
      case 'indicativepowersupplystudy':
        return 'indicativePowerSupplyStudy';
      case 'ipssparameter':
        return 'ipssParameter';
      case 'mbrauthorization':
        return 'mbrAuthorization';
      case 'mitigation':
      case 'mitigations':
        return 'mitigation';
      case 'selflimitation':
      case 'selflimit':
        return 'selfLimitation';
      case 'operatingreserve':
      case 'or':
        return 'operatingReserve';
      default:
        return '';
    }
  }

  private buildDropdownWhere(modelName: string, filter: AnyRecord) {
    const where: AnyRecord = {};
    if (typeof filter.aid === 'number' && filter.aid > 0) where.aid = filter.aid;
    if (typeof filter.cid === 'number' && filter.cid > 0) where.cid = filter.cid;
    if (typeof filter.isActive === 'boolean') where.isActive = filter.isActive;
    if (modelName === 'imssParameter' && typeof filter.cid === 'number' && filter.cid > 0) where.cid = filter.cid;
    if (modelName === 'ipssParameter' && typeof filter.cid === 'number' && filter.cid > 0) where.cid = filter.cid;
    return where;
  }

  private extractNumberWhere(where: string, key: string, fallback?: unknown) {
    const parsed = this.extractWhereValue(where, key);
    return parsed === null ? this.numberValue(fallback) || undefined : this.numberValue(parsed);
  }

  private extractBooleanWhere(where: string, key: string) {
    const parsed = this.extractWhereValue(where, key);
    if (parsed === null) return undefined;
    return this.booleanValue(parsed, undefined);
  }

  private extractWhereValue(where: string, key: string) {
    const normalized = (where || '').replace(/^where\s+/i, '').trim();
    if (!normalized) return null;
    const matches = normalized.match(new RegExp(`${key}\\s*=\\s*([^\\s&]+)`, 'i'));
    if (!matches?.[1]) return null;
    return decodeURIComponent(matches[1].replace(/^['"]|['"]$/g, ''));
  }

  private projectDropdownRecord(record: AnyRecord, modelName: string, valueField: string, textField: string) {
    const fallbackValue =
      record?.[valueField] ??
      record?.[this.idFieldForModel(modelName)] ??
      record?.value ??
      record?.id ??
      record?.gid ??
      record?.aid ??
      record?.cid ??
      record?.pid ??
      record?.invoiceId ??
      null;
    const fallbackText =
      record?.[textField] ??
      record?.text ??
      record?.name ??
      record?.rolename ??
      record?.groupname ??
      record?.accountName ??
      record?.companyName ??
      record?.fullName ??
      record?.entityName ??
      record?.assetName ??
      '';

    return {
      ...record,
      value: fallbackValue,
      text: fallbackText,
      [valueField || 'value']: fallbackValue,
      [textField || 'text']: fallbackText,
    };
  }

  private async listAccountGroups(aid?: number) {
    const groups = await this.prisma.accountGroup.findMany({
      where: {
        ...(aid ? { aid } : {}),
        isActive: true,
      },
      orderBy: { agid: 'asc' },
    });
    return groups.map((group) => this.toLegacyAccountGroup(group));
  }

  private async handleAccountGet(action: string, params: AnyRecord) {
    if (action === 'getaccoungroupsbyaid' || action === 'getaccountgroupsbyaid' || action.includes('accountgroup')) {
      return this.listAccountGroups(this.numberValue(params.p1));
    }
    if (action.includes('detail')) {
      const aid = this.numberValue(params.p1);
      if (aid) {
        const account = await this.prisma.account.findUnique({ where: { aid } });
        return account ? [this.toLegacyAccount(account)] : [];
      }
      return this.listAccounts();
    }
    if (action === 'getaccountandcompany' || action === 'getaccountandcompanybycid' || action === 'getadminaccountcompany') {
      return this.getAccountAndCompanyDetails(this.numberValue(params.p1), this.numberValue(params.p2));
    }
    if (action === 'admingetaccounts') return this.listAccounts();
    if (action === 'getaccountdetailsbycid') return this.listAccountsByCid(this.numberValue(params.p1));
    if (action === 'getaccountdetailsbyaid') return this.listAccountsByAid(this.numberValue(params.p1));
    return this.listAccounts();
  }

  private async handleAccountPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action === 'insupdgroups') return this.saveAccountGroup(body);
    if (action === 'createaccount' || action === 'updateaccount' || action === 'updateaccountdetails') {
      return this.saveAccount(body, query);
    }
    return { success: false, message: `Unsupported account action: ${action}`, data: body ?? {} };
  }

  private async handleCompanyGet(action: string, params: AnyRecord) {
    if (action === 'getcompanylistbyaid' || action === 'admingetcompaniesbyaid') {
      return this.listCompanies({ aid: this.numberValue(params.p1), activeOnly: action === 'getcompanylistbyaid' });
    }
    if (action === 'getcompanylistbycid') return this.listCompanies({ cid: this.numberValue(params.p1), activeOnly: true });
    if (action === 'getcompanylistbyuidagid') return this.listCompaniesByUser(this.numberValue(params.p1), this.numberValue(params.p2));
    if (action === 'getcompanydetails') return this.getCompanyDetails(this.numberValue(params.p1));
    if (action === 'getfilingflagsbycid') return this.getCompanyFilingFlags(this.numberValue(params.p1));
    return this.listCompanies({ activeOnly: true });
  }

  private async handleCompanyPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action === 'createcompany' || action === 'updatecompany' || action === 'updatecompanydetails') {
      return this.saveCompany(body, params, query);
    }
    if (action === 'updatefilingflags') return this.updateCompanyFilingFlags(body, query);
    if (action === 'copyentitydata') return this.copyEntityData(body);
    return { success: false, message: `Unsupported company action: ${action}`, data: body ?? {} };
  }

  private async handleUserGet(action: string, params: AnyRecord) {
    if (action.includes('roletypes')) return this.getRoleTypes();
    if (action.includes('inactive')) return this.listUsers({ cid: this.numberValue(params.p1), isActive: false });
    if (action.includes('byuid') || action.includes('getuserbyuid')) {
      const user = await this.prisma.user.findUnique({ where: { uid: this.numberValue(params.p1) } });
      return user ? this.toLegacyUser(user) : null;
    }
    if (action === 'getlistbycid') return this.listUsers({ cid: this.numberValue(params.p1), isActive: true });
    return this.listUsers({ isActive: true });
  }

  private async handleUserPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action === 'createuser') return this.createUser(body);
    if (action === 'updateuser' || action === 'updatemyprofile') return this.updateUser(body);
    if (action === 'updateuseractivatebycid') return this.updateUserActivateByCID(body);
    if (action === 'deleteuserinactivesbycid') return this.deleteUserInActivesByCID(body);
    return { success: false, message: `Unsupported user action: ${action}`, data: body ?? {} };
  }

  private async handleFilingGet(action: string, params: AnyRecord) {
    if (action === 'getfilingslist') return this.listFilings();
    if (action === 'getfilingbyid') return this.getFilingById(this.numberValue(params.p1));
    if (action === 'getlistbycid') return this.listFilingsByCid(this.numberValue(params.p1));
    return this.listFilings();
  }

  private async handleFilingPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action === 'insupdfiling' || action === 'createfiling' || action === 'updatefiling') {
      return this.saveFiling(body, params, query);
    }
    return { success: false, message: `Unsupported filing action: ${action}`, data: body ?? {} };
  }

  private async handleInvoiceGet(action: string, params: AnyRecord) {
    if (action === 'getinvoicedatabycid' || action === 'admingetinvoices') return this.listInvoicesByCid(this.numberValue(params.p1));
    if (action === 'getinvoicebyid') return this.getInvoiceById(this.numberValue(params.p1));
    if (action === 'getadmingetinvoicemonthlycountbycid') return this.getMonthlyInvoiceCount(this.numberValue(params.p1), this.numberValue(params.p2));
    if (action === 'getadmingetinvoicemonthlybyid') return this.getMonthlyInvoiceById(this.numberValue(params.p1));
    if (action === 'getfilingsforinvoicebycid' || action === 'getfilingsforinvoicesbycid') return this.listFilingsByCid(this.numberValue(params.p1));
    return this.listInvoicesByCid(this.numberValue(params.p1));
  }

  private async handleInvoicePost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action.includes('forwardtoexternal')) {
      return this.forwardToExternal('invoice', action, body, params, query);
    }

    if (action === 'createinvoice' || action === 'updateinvoice') return this.saveInvoice(body, query);
    if (action === 'createmonthlyinvoice' || action === 'updatemonthlyinvoice') return this.saveMonthlyInvoice(body, query);
    if (action === 'updatesentinvoice') return this.markInvoiceSent(this.numberValue(params.p1));
    if (action === 'updatefercstatus') {
      if (body?.invoiceId || body?.InvoiceId) {
        return this.updateInvoiceStatus(body);
      }
      return this.updateCompanyFercStatus(body);
    }
    if (action === 'adminupdateinvoicesisbilledbyids') return this.updateInvoicesBilled(body);
    if (action === 'adminchangeaccountforven') return this.changeInvoiceAccount(this.numberValue(params.p1));
    return { success: false, message: `Unsupported invoice action: ${action}`, data: body ?? {} };
  }

  private async forwardToExternal(modelName: string, action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const targetUrl = this.stringValue(query.url || query.externalUrl || body?.url || body?.externalUrl || body?.targetUrl);
    if (!targetUrl) {
      return {
        success: false,
        message: 'External URL is required',
        action,
        modelName,
        received: body ?? {},
      };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return {
        success: false,
        message: 'External URL is invalid',
        action,
        modelName,
        url: targetUrl,
      };
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        success: false,
        message: 'External URL must use http or https',
        action,
        modelName,
        url: targetUrl,
      };
    }

    const payload = { ...this.toRecord(body) };
    delete payload.url;
    delete payload.externalUrl;
    delete payload.targetUrl;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(parsedUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Venus-Source': 'compatibility-api',
          'X-Venus-Model': modelName,
        },
        body: JSON.stringify({
          action,
          modelName,
          params,
          query: { ...query, url: undefined, externalUrl: undefined },
          data: payload,
        }),
        signal: controller.signal,
      });

      const responseText = await response.text();
      let responseBody: unknown = responseText;
      try {
        responseBody = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseBody = responseText;
      }

      return {
        success: response.ok,
        message: response.ok ? 'Forwarded successfully' : 'Forward target returned an error',
        action,
        modelName,
        url: parsedUrl.toString(),
        status: response.status,
        statusText: response.statusText,
        response: responseBody,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.name === 'AbortError' ? 'Forward request timed out' : 'Forward request failed',
        action,
        modelName,
        url: parsedUrl.toString(),
        error: error?.message || String(error),
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async handleImssGet(action: string, params: AnyRecord) {
    if (action === 'getlistbycid') return this.listModelRecords('indicativeMarketScreenStudy', { cid: this.numberValue(params.p1) });
    if (action === 'getrecordbyid' || action === 'getbyid') return this.getModelRecordById('indicativeMarketScreenStudy', this.numberValue(params.p1));
    if (action === 'getparamslistbycidandid') return this.listModelRecords('imssParameter', { cid: this.numberValue(params.p1), parentId: this.numberValue(params.p2) });
    return this.listModelRecords('indicativeMarketScreenStudy', { cid: this.numberValue(params.p1) });
  }

  private async handleIpssGet(action: string, params: AnyRecord) {
    if (action === 'getlistbycid') return this.listModelRecords('indicativePowerSupplyStudy', { cid: this.numberValue(params.p1) });
    if (action === 'getrecordbyid' || action === 'getbyid') return this.getModelRecordById('indicativePowerSupplyStudy', this.numberValue(params.p1));
    if (action === 'getparamslistbycidandid') return this.listModelRecords('ipssParameter', { cid: this.numberValue(params.p1), parentId: this.numberValue(params.p2) });
    return this.listModelRecords('indicativePowerSupplyStudy', { cid: this.numberValue(params.p1) });
  }

  private async handleImssPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action === 'insupdimssui' || action === 'insupdimssuicopy') {
      return this.saveImssLike(body, 'indicativeMarketScreenStudy', 'imssParameter');
    }
    return this.handleGenericPost('indicativeMarketScreenStudy', action, body, params, query);
  }

  private async handleIpssPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action === 'insupdipssui' || action === 'insupdipssuicopy') {
      return this.saveImssLike(body, 'indicativePowerSupplyStudy', 'ipssParameter');
    }

    if (action === 'bulkimportipssstudy') {
      return this.bulkImportGeneric(body, 'indicativePowerSupplyStudy', 'ipssParameter');
    }

    return this.handleGenericPost('indicativePowerSupplyStudy', action, body, params, query);
  }

  private async handleFercApiGet(action: string, params: AnyRecord) {
    const payload = await this.buildFercApiPayload(params);
    if (action === 'pulldatabysub' || action === 'pulldatabyentity') {
      return {
        success: true,
        message: 'FERC data loaded successfully',
        action,
        data: payload,
      };
    }
    return {
      success: true,
      message: 'FERC API endpoint is available',
      data: payload,
    };
  }

  private async handleFercApiPost(action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const payload = await this.buildFercApiPayload({ ...body, ...params, ...query });
    return {
      success: true,
      message: 'FERC API endpoint is available',
      action,
      received: body ?? {},
      params,
      query,
      data: payload,
    };
  }

  private async buildFercApiPayload(source: AnyRecord) {
    const uid = this.numberValue(source.uid || source.userId || source.user || source.p1);
    const cid = this.numberValue(source.cid || source.companyCid || source.companyID || source.companyId || source.p2);
    const companyId = this.stringValue(source.company_id || source.companyId || source.companyID || source.company || source.p3 || '');
    const entityQuery = this.stringValue(source.entity || source.entityName || source.subFk || source.p4 || '');

    const user = uid ? await this.prisma.user.findUnique({ where: { uid } }) : null;
    const company = companyId
      ? await this.prisma.company.findFirst({ where: { companyId } })
      : cid
        ? await this.prisma.company.findUnique({ where: { cid } })
        : null;
    const effectiveCid = company?.cid || cid;

    const [accounts, companies, assets, entities, filings] = await Promise.all([
      this.prisma.account.findMany({ where: { ...(user?.aid ? { aid: user.aid } : {}), isActive: true }, orderBy: { aid: 'asc' } }),
      this.prisma.company.findMany({
        where: {
          ...(effectiveCid ? { cid: effectiveCid } : {}),
          isActive: true,
        },
        orderBy: { cid: 'asc' },
      }),
      this.prisma.asset.findMany({
        where: {
          ...(effectiveCid ? { cid: effectiveCid } : {}),
        },
        orderBy: { assetid: 'asc' },
      }),
      this.prisma.entity.findMany({
        where: {
          ...(effectiveCid ? { cid: effectiveCid } : {}),
          ...(entityQuery
            ? {
                OR: [
                  { name: { contains: entityQuery, mode: 'insensitive' } },
                  { entityName: { contains: entityQuery, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        orderBy: { entityid: 'asc' },
      }),
      this.prisma.filing.findMany({
        where: { ...(effectiveCid ? { cid: effectiveCid } : {}) },
        orderBy: { fid: 'asc' },
      }),
    ]);

    const [
      authorizations,
      categoryStatus,
      mitigations,
      selfLimitations,
      operatingReserves,
      entitiesToEntities,
      entitiesToGeneratorAssets,
      entitiesToPpas,
      entitiesToVerticalAssets,
      indicativeMss,
      indicativePss,
    ] = await Promise.all([
      this.listModelRecords('mbrAuthorization', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('categoryStatus', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('mitigation', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('selfLimitation', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('operatingReserve', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('entityToEntity', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('entityToGeneratorAsset', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('entityToPpa', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('entityToVerticalAsset', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('indicativeMarketScreenStudy', { cid: effectiveCid, isActive: true }),
      this.listModelRecords('indicativePowerSupplyStudy', { cid: effectiveCid, isActive: true }),
    ]);

    const matchesSubmission = (record: AnyRecord) => {
      if (!entityQuery) return true;
      const queryText = entityQuery.toLowerCase();
      return [
        record.mbr_submission_fk,
        record.fercId,
        record.authorization_docket_number,
        record.authorization_docket,
        record.entity_ID,
        record.reportable_entity_ID,
        record.blanket_Auth_Docket_Number,
      ].some((value) => String(value ?? '').toLowerCase().includes(queryText));
    };

    return {
      user: user ? this.toLegacyUser(user) : null,
      company: company ? this.toLegacyCompany(company) : null,
      accounts: accounts.map((item) => this.toLegacyAccount(item)),
      companies: companies.map((item) => this.toLegacyCompany(item)),
      assets: assets.map((item) => this.toLegacyAsset(item)),
      entities: entities.map((item) => this.toLegacyEntity(item)),
      filings: filings.map((item) => this.decorateRecord('filing', item)),
      screens: {
        authorizations: authorizations.filter(matchesSubmission),
        categoryStatus: categoryStatus.filter(matchesSubmission),
        mitigations: mitigations.filter(matchesSubmission),
        selfLimitations: selfLimitations.filter(matchesSubmission),
        operatingReserves: operatingReserves.filter(matchesSubmission),
        entitiesToEntities: entitiesToEntities.filter(matchesSubmission),
        entitiesToGeneratorAssets: entitiesToGeneratorAssets.filter(matchesSubmission),
        entitiesToPPAs: entitiesToPpas.filter(matchesSubmission),
        entitiesToVerticalAssets: entitiesToVerticalAssets.filter(matchesSubmission),
        indicativeMSS: indicativeMss.filter(matchesSubmission),
        indicativePSS: indicativePss.filter(matchesSubmission),
      },
      source: {
        uid,
        cid: effectiveCid,
        companyId,
        entityQuery,
      },
    };
  }

  private async handleGenericGet(modelName: string, action: string, params: AnyRecord, query: AnyRecord) {
    if (this.isXmlAction(action)) {
      const cid = this.numberValue(params.p1 || query.cid);
      const ids = this.uidList(query.assetids || query.ids || query.recordIds);
      const records = await this.listModelRecords(modelName, {
        cid,
        ids: ids.length ? ids : undefined,
      });
      return this.buildXmlPayload(cid, records);
    }

    if (action === 'getlistbycid' || action === 'getlist') {
      return this.listModelRecords(modelName, { cid: this.numberValue(params.p1 || query.cid), isActive: true });
    }

    if (action === 'getrecordbyid' || action === 'getbyid' || action === 'getauthbyid' || action.endsWith('byid')) {
      return this.getModelRecordById(modelName, this.numberValue(params.p1));
    }

    if (action === 'getparamslistbycidandid') {
      return this.listModelRecords(modelName === 'indicativeMarketScreenStudy' ? 'imssParameter' : 'ipssParameter', {
        cid: this.numberValue(params.p1),
        parentId: this.numberValue(params.p2),
      });
    }

    return this.listModelRecords(modelName, { cid: this.numberValue(params.p1 || query.cid) });
  }

  private async handleGenericPost(modelName: string, action: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    if (action.includes('forwardtoexternal')) {
      return this.forwardToExternal(modelName, action, body, params, query);
    }

    if (this.isCreateAction(action) || this.isSaveAction(action) || action.startsWith('insupd')) {
      return this.saveModelRecord(modelName, body, params, query);
    }

    if (this.isCopyAction(action)) {
      return this.copyEntityData(body);
    }

    return { success: true, message: 'Saved successfully', data: body ?? {} };
  }

  private async saveImssLike(body: AnyRecord, studyModel: string, paramsModel: string) {
    const study = await this.saveModelRecord(studyModel, body, {}, {});
    const paramsList = this.extractParamList(body);

    if (paramsList.length) {
      for (const param of paramsList) {
        await this.saveModelRecord(paramsModel, {
          ...param,
          cid: this.numberValue(body.cid || body.Cid || 1),
          [paramsModel === 'imssParameter' ? 'imssId' : 'ipssId']: (study as AnyRecord).pid || (study as AnyRecord).pid,
        }, {}, {});
      }
    }

    return {
      success: true,
      message: `${studyModel} saved successfully`,
      data: study,
    };
  }

  private async bulkImportGeneric(body: AnyRecord, studyModel: string, paramsModel: string) {
    const items = Array.isArray(body?.records) ? body.records : Array.isArray(body?.items) ? body.items : [];
    let count = 0;
    for (const item of items) {
      await this.saveImssLike(item, studyModel, paramsModel);
      count += 1;
    }
    return { success: true, message: 'Bulk import completed successfully', count };
  }

  private async listModelRecords(modelName: string, filter: AnyRecord = {}) {
    const client = (this.prisma as AnyRecord)[modelName];
    if (!client?.findMany) return [];
    const where: AnyRecord = {};
    if (typeof filter.cid === 'number' && filter.cid > 0) where.cid = filter.cid;
    if (typeof filter.aid === 'number' && filter.aid > 0) where.aid = filter.aid;
    if (typeof filter.isActive === 'boolean') where.isActive = filter.isActive;
    if (Array.isArray(filter.ids) && filter.ids.length) {
      const idField = this.idFieldForModel(modelName);
      where[idField] = { in: filter.ids.filter((item: unknown) => Number.isFinite(Number(item)) && Number(item) > 0) };
    }
    if (typeof filter.parentId === 'number' && filter.parentId > 0) {
      if (modelName === 'imssParameter') where.imssId = filter.parentId;
      if (modelName === 'ipssParameter') where.ipssId = filter.parentId;
    }
    const records = await client.findMany({ where, orderBy: this.orderByForModel(modelName) });
    return records.map((record: AnyRecord) => this.decorateRecord(modelName, record));
  }

  private async getModelRecordById(modelName: string, idValue: number) {
    if (!idValue) return null;
    const client = (this.prisma as AnyRecord)[modelName];
    if (!client?.findUnique) return null;
    const idField = this.idFieldForModel(modelName);
    const record = await client.findUnique({ where: { [idField]: idValue } });
    return record ? this.decorateRecord(modelName, record) : null;
  }

  private async saveModelRecord(modelName: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const client = (this.prisma as AnyRecord)[modelName];
    if (!client?.upsert && !client?.create) return { success: true, message: `${modelName} saved successfully`, data: body ?? {} };

    const idField = this.idFieldForModel(modelName);
    const idValue = this.resolveIdValue(modelName, body, params, query);
    const data = this.buildModelData(modelName, body, params, query);

    if (idValue && client.upsert) {
      const existing = await client.findUnique?.({ where: { [idField]: idValue } });
      if (existing) {
        const updated = await client.update({ where: { [idField]: idValue }, data });
        return this.attachResultId(modelName, updated);
      }
      const created = await client.create({ data: { ...data, [idField]: idValue } });
      return this.attachResultId(modelName, created);
    }

    const created = await client.create({ data });
    return this.attachResultId(modelName, created);
  }

  private async deleteGeneric(modelName: string, params: AnyRecord) {
    const client = (this.prisma as AnyRecord)[modelName];
    if (!client?.updateMany && !client?.deleteMany) return;
    const idField = this.idFieldForModel(modelName);
    const idValue = this.numberValue(params.p1);
    if (!idValue) return;
    if (client.updateMany) {
      await client.updateMany({ where: { [idField]: idValue }, data: { isActive: false } });
      return { success: true, resultId: idValue, ResultId: idValue };
    }
    await client.deleteMany({ where: { [idField]: idValue } });
    return { success: true, resultId: idValue, ResultId: idValue };
  }

  private attachResultId(modelName: string, record: AnyRecord) {
    const decorated = this.decorateRecord(modelName, record) as AnyRecord;
    const resultId = this.resolveResultId(modelName, decorated);
    return {
      ...decorated,
      resultId,
      ResultId: resultId,
    };
  }

  private resolveResultId(modelName: string, record: AnyRecord) {
    switch (modelName) {
      case 'user':
        return record.uid ?? record.id ?? 0;
      case 'role':
        return record.gid ?? record.id ?? 0;
      case 'account':
        return record.aid ?? record.id ?? 0;
      case 'accountGroup':
        return record.agid ?? record.id ?? 0;
      case 'company':
        return record.cid ?? record.id ?? 0;
      case 'filing':
        return record.fid ?? record.id ?? 0;
      case 'invoice':
      case 'monthlyInvoice':
        return record.invoiceId ?? record.id ?? 0;
      case 'mbrAuthorization':
        return record.mbrauthid ?? record.pid ?? record.id ?? 0;
      default:
        return record.pid ?? record.assetid ?? record.entityid ?? record.id ?? 0;
    }
  }

  private async createUser(body: AnyRecord) {
    const email = this.stringValue(body.email || body.Email || body.eMail);
    const firstName = this.stringValue(body.firstName || body.FirstName || body.first_name || body.fname || body.Fname);
    const lastName = this.stringValue(body.lastName || body.LastName || body.last_name || body.lname || body.Lname);
    const name = this.stringValue(body.name || body.Name || body.fullName || body.username || `${firstName} ${lastName}`.trim() || email);
    if (!email) return { success: false, message: 'Email is required' };

    const password = this.stringValue(body.password || body.Password || 'Password123');
    const hashedPassword = await bcrypt.hash(password, 10);
    const gid = this.numberValue(body.gid || body.Gid || body.roleGid || 3);
    const role = await this.roleName(gid);

    const user = await this.prisma.user.upsert({
      where: { email: email.toLowerCase() },
      update: {
        name,
        role,
        aid: this.numberValue(body.aid || body.Aid || 1),
        cid: this.numberValue(body.cid || body.Cid || 1),
        gid,
        isActive: true,
      },
      create: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        aid: this.numberValue(body.aid || body.Aid || 1),
        cid: this.numberValue(body.cid || body.Cid || 1),
        gid,
      },
    });
    this.rememberUserProfileExtras(user.uid, body);

    return {
      success: true,
      message: 'User saved successfully',
      user: this.toLegacyUser(user),
      resultId: user.uid,
      ResultId: user.uid,
    };
  }

  private async updateUser(body: AnyRecord) {
    const uid = this.numberValue(body.uid || body.Uid || body.id || body.userId);
    const email = this.stringValue(body.email || body.Email || body.eMail);
    const gid = this.numberValue(body.gid || body.Gid || body.roleGid || 3);

    if (!uid && !email) return { success: false, message: 'User id or email is required' };

    const firstName = this.stringValue(body.firstName || body.FirstName || body.first_name || body.fname || body.Fname);
    const lastName = this.stringValue(body.lastName || body.LastName || body.last_name || body.lname || body.Lname);
    const fullName = this.stringValue(body.name || body.Name || body.fullName || `${firstName} ${lastName}`.trim() || email || 'User');

    const data: AnyRecord = {
      name: fullName,
      ...(email ? { email: email.toLowerCase() } : {}),
      role: await this.roleName(gid),
      aid: this.numberValue(body.aid || body.Aid || 1),
      cid: this.numberValue(body.cid || body.Cid || 1),
      gid,
      isActive: body.isActive === undefined ? true : Boolean(body.isActive),
    };

    const password = this.stringValue(body.password || body.Password);
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = uid
      ? await this.prisma.user.update({ where: { uid }, data })
      : await this.prisma.user.update({ where: { email: email.toLowerCase() }, data });
    this.rememberUserProfileExtras(user.uid, body);

    return {
      success: true,
      message: 'User updated successfully',
      user: this.toLegacyUser(user),
      resultId: user.uid,
      ResultId: user.uid,
    };
  }

  private async updateUserActivateByCID(body: AnyRecord) {
    const cid = this.numberValue(body.cid || body.Cid);
    const uids = this.uidList(body.uiDs || body.uids || body.Uids || body.uid);
    const result = await this.prisma.user.updateMany({
      where: {
        ...(cid ? { cid } : {}),
        ...(uids.length ? { uid: { in: uids } } : {}),
        isActive: false,
      },
      data: { isActive: true },
    });
    return { success: true, message: 'Users activated', count: result.count, resultId: result.count, ResultId: result.count };
  }

  private async deleteUserInActivesByCID(body: AnyRecord) {
    const cid = this.numberValue(body.cid || body.Cid);
    const uids = this.uidList(body.uiDs || body.uids || body.Uids || body.uid);
    const result = await this.prisma.user.deleteMany({
      where: {
        ...(cid ? { cid } : {}),
        ...(uids.length ? { uid: { in: uids } } : {}),
        isActive: false,
      },
    });
    return { success: true, message: 'Inactive users deleted', count: result.count, resultId: result.count, ResultId: result.count };
  }

  private async listUsers(filter: { cid?: number; isActive?: boolean }) {
    const users = await this.prisma.user.findMany({
      where: {
        ...(filter.cid ? { cid: filter.cid } : {}),
        ...(filter.isActive === undefined ? {} : { isActive: filter.isActive }),
      },
      orderBy: { uid: 'asc' },
    });
    return users.map((user) => this.toLegacyUser(user));
  }

  private async listAccounts() {
    const accounts = await this.prisma.account.findMany({ where: { isActive: true }, orderBy: { aid: 'asc' } });
    return accounts.map((account) => this.toLegacyAccount(account));
  }

  private async listAccountsByAid(aid: number) {
    const account = await this.prisma.account.findUnique({ where: { aid } });
    return account ? [this.toLegacyAccount(account)] : [];
  }

  private async listAccountsByCid(cid: number) {
    const company = await this.prisma.company.findUnique({ where: { cid } });
    if (!company) return [];
    const account = await this.prisma.account.findUnique({ where: { aid: company.aid } });
    return account ? [this.toLegacyAccount(account)] : [];
  }

  private async getAccountAndCompanyDetails(uid?: number, cid?: number) {
    const user = uid ? await this.prisma.user.findUnique({ where: { uid } }) : null;
    const companies = await this.prisma.company.findMany({
      where: {
        ...(user?.aid ? { aid: user.aid } : {}),
        ...(cid ? { cid } : {}),
        isActive: true,
      },
      orderBy: { cid: 'asc' },
    });
    const accounts = await this.prisma.account.findMany({ where: { isActive: true }, orderBy: { aid: 'asc' } });
    return {
      accounts: accounts.map((item) => this.toLegacyAccount(item)),
      companies: companies.map((item) => this.toLegacyCompany(item)),
    };
  }

  private async updateCompanyFercStatus(body: AnyRecord) {
    const cid = this.numberValue(body.cid || body.Cid || body.companyCid || body.companyID || body.companyId);
    if (!cid) {
      return { success: false, message: 'cid is required' };
    }

    const company = await this.prisma.company.findUnique({ where: { cid } });
    if (!company) {
      return { success: false, message: 'Company not found', cid };
    }

    const fercStatusData = {
      ...this.toRecord(company.data),
      fercStatusUpdatedAt: new Date().toISOString(),
      fercStatusUpdatedBy: this.numberValue(body.uid || body.Uid || body.modifiedUID || body.modifiedUid || 0) || null,
      fercStatus: 'UPDATED',
    };

    const updatedCompany = await this.prisma.company.update({
      where: { cid },
      data: { data: fercStatusData },
    });

    const flags = await this.prisma.companyFilingFlags.upsert({
      where: { cid },
      update: {
        data: {
          ...(this.toRecord((await this.prisma.companyFilingFlags.findUnique({ where: { cid } }))?.data)),
          ...fercStatusData,
        },
      },
      create: {
        cid,
        includeAssets: true,
        includeEntities: true,
        includeFilings: true,
        data: fercStatusData,
      },
    });

    return {
      success: true,
      message: 'FERC status updated successfully',
      cid,
      company: this.toLegacyCompany(updatedCompany),
      data: this.toLegacyCompanyFilingFlags(flags),
      resultId: cid,
      ResultId: cid,
    };
  }

  private async updateIncInFilingFlag(body: AnyRecord, params: AnyRecord, query: AnyRecord, updateAll: boolean) {
    const cid = this.numberValue(params.p1 || body.cid || body.Cid || query.cid);
    const table = this.stringValue(body.table || body.Table || '');
    const tableId = this.stringValue(body.tableId || body.tableID || body.TableId || body.TableID || '');
    const value = this.booleanValue(body.value, false);
    const whereIds = this.uidList(body.whereIds || body.whereIdsCsv || body.whereIdsList || body.id || body.ids);
    const uid = this.numberValue(body.uid || body.Uid || body.modifiedUID || body.modifiedUid || query.uid || 0) || null;

    if (!cid) {
      return { success: false, message: 'cid is required' };
    }
    if (!table) {
      return { success: false, message: 'table is required', cid };
    }

    const modelName = this.modelForFilingFlagTable(table);
    if (!modelName) {
      return {
        success: false,
        message: `Unsupported filing flag table: ${table}`,
        cid,
        table,
      };
    }

    const client = (this.prisma as AnyRecord)[modelName];
    if (!client?.findMany || !client?.update) {
      return {
        success: false,
        message: `Filing flag updates are not supported for ${table}`,
        cid,
        table,
      };
    }

    const idField = this.idFieldForModel(modelName);
    const where: AnyRecord = { cid };
    if (!updateAll && !whereIds.length) {
      return {
        success: false,
        message: 'whereIds is required for single-row filing flag updates',
        cid,
        table,
      };
    }

    if (!updateAll && whereIds.length) {
      where[idField] = { in: whereIds };
    }

    const records = await client.findMany({
      where,
      orderBy: this.orderByForModel(modelName),
    });

    if (!records.length) {
      return {
        success: false,
        message: 'No matching records found',
        cid,
        table,
      };
    }

    const updatedAt = new Date().toISOString();
    const updates: AnyRecord[] = [];

    for (const record of records) {
      const existingData = this.toRecord(record?.data);
      const mergedData = {
        ...existingData,
        IncInFiling: value,
        incInFiling: value,
        filingFlagTable: table,
        filingFlagTableId: tableId || idField,
        filingFlagWhereIds: updateAll ? [] : whereIds,
        filingFlagUpdatedAt: updatedAt,
        filingFlagUpdatedBy: uid,
      };

      const idValue = this.numberValue(record?.[idField] || record?.id);
      const updated = await client.update({
        where: { [idField]: idValue },
        data: { data: mergedData },
      });
      updates.push(updated);
    }

    await this.persistCompanyFilingFlagState(cid, {
      table,
      tableId: tableId || idField,
      value,
      whereIds: updateAll ? records.map((record: AnyRecord) => this.numberValue(record?.[idField])).filter((item: number) => item > 0) : whereIds,
      updateAll,
      updatedAt,
      updatedBy: uid,
      count: updates.length,
    });

    return {
      success: true,
      message: updateAll ? 'Filing flags updated successfully' : 'Filing flag updated successfully',
      cid,
      table,
      tableId: tableId || idField,
      value,
      count: updates.length,
      resultId: updates.length,
      ResultId: updates.length,
    };
  }

  private async saveAccountGroup(body: AnyRecord) {
    const agid = this.numberValue(body.agid || body.AGID || body.id);
    const aid = this.numberValue(body.aid || body.AID || 1);
    const gid = this.numberValue(body.gid || body.GID || 1);
    const groupname = this.stringValue(body.groupname || body.name || 'Default Group') || 'Default Group';
    const persistedData = this.cleanDataForPersist(body);
    const record = agid
      ? await this.prisma.accountGroup.upsert({
          where: { agid },
          update: { aid, gid, name: groupname, groupname, isActive: this.booleanValue(body.isActive, true), data: persistedData },
          create: { agid, aid, gid, name: groupname, groupname, isActive: this.booleanValue(body.isActive, true), data: persistedData },
        })
      : await this.prisma.accountGroup.create({
          data: { aid, gid, name: groupname, groupname, isActive: this.booleanValue(body.isActive, true), data: persistedData },
        });
    return {
      success: true,
      message: 'Account group saved successfully',
      group: this.toLegacyAccountGroup(record),
      resultId: record.agid,
      ResultId: record.agid,
    };
  }

  private async saveAccount(body: AnyRecord, query: AnyRecord) {
    const aid = this.numberValue(body.aid || body.AID || body.id || body.resultId || body.ResultId || query.aid);
    const name = this.stringValue(body.name || body.accName || body.accountName || body.Account || 'Account') || 'Account';
    const persistedData = this.cleanDataForPersist(body);
    const record = aid
      ? await this.prisma.account.upsert({
          where: { aid },
          update: {
            name,
            accName: this.stringValue(body.accName || body.accountName || name) || name,
            accountName: this.stringValue(body.accountName || body.accName || name) || name,
            url: this.stringValue(body.url || body.Url || '') || null,
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
          create: {
            aid,
            name,
            accName: this.stringValue(body.accName || body.accountName || name) || name,
            accountName: this.stringValue(body.accountName || body.accName || name) || name,
            url: this.stringValue(body.url || body.Url || '') || null,
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        })
      : await this.prisma.account.create({
          data: {
            name,
            accName: this.stringValue(body.accName || body.accountName || name) || name,
            accountName: this.stringValue(body.accountName || body.accName || name) || name,
            url: this.stringValue(body.url || body.Url || '') || null,
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        });
    return {
      success: true,
      message: 'Account saved successfully',
      account: this.toLegacyAccount(record),
      resultId: record.aid,
      ResultId: record.aid,
    };
  }

  private async listCompanies(filter: { aid?: number; cid?: number; activeOnly?: boolean }) {
    const companies = await this.prisma.company.findMany({
      where: {
        ...(filter.aid ? { aid: filter.aid } : {}),
        ...(filter.cid ? { cid: filter.cid } : {}),
        ...(filter.activeOnly === false ? {} : { isActive: true }),
      },
      orderBy: { cid: 'asc' },
    });
    return companies.map((company) => this.toLegacyCompany(company));
  }

  private async listCompaniesByUser(uid: number, agid: number) {
    const user = uid ? await this.prisma.user.findUnique({ where: { uid } }) : null;
    const companies = await this.prisma.company.findMany({
      where: {
        ...(user?.aid ? { aid: user.aid } : {}),
        ...(agid ? { agid } : {}),
        isActive: true,
      },
      orderBy: { cid: 'asc' },
    });
    return companies.map((company) => this.toLegacyCompany(company));
  }

  private async getCompanyDetails(cid: number) {
    const company = await this.prisma.company.findUnique({ where: { cid } });
    return company ? this.toLegacyCompany(company) : null;
  }

  private async getCompanyFilingFlags(cid: number) {
    const record = await this.prisma.companyFilingFlags.upsert({
      where: { cid },
      update: {},
      create: { cid, includeAssets: true, includeEntities: true, includeFilings: true },
    });
    return this.toLegacyCompanyFilingFlags(record);
  }

  private async saveCompany(body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const cid = this.numberValue(body.cid || body.CID || body.id || body.resultId || body.ResultId || query.cid || params.p1);
    const aid = this.numberValue(body.aid || body.AID || query.aid || 1);
    const agid = this.numberValue(body.agid || body.AGID || query.agid || 1);
    const companyName = this.stringValue(body.companyName || body.CompanyName || body.company_name || body.Title || body.fullName || body.full_name || body.tradingName || 'Company') || 'Company';
    const companyIdValue = this.stringValue(body.companyId || body.company_id || body.CompanyID || body.CompanyId || body.companyID || '') || null;
    const persistedData = this.cleanDataForPersist(body);
    let effectiveCid = cid;

    if (!effectiveCid && companyIdValue) {
      const existing = await this.prisma.company.findFirst({ where: { companyId: companyIdValue } });
      if (existing?.cid) {
        effectiveCid = existing.cid;
      }
    }

    const record = effectiveCid
      ? await this.prisma.company.upsert({
          where: { cid: effectiveCid },
          update: {
            aid,
            agid,
            companyId: companyIdValue,
            companyName,
            fullName: this.stringValue(body.fullName || body.full_name || companyName) || companyName,
            tradingName: this.stringValue(body.tradingName || body.trading_name || companyName) || companyName,
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
          create: {
            cid: effectiveCid,
            aid,
            agid,
            companyId: companyIdValue,
            companyName,
            fullName: this.stringValue(body.fullName || body.full_name || companyName) || companyName,
            tradingName: this.stringValue(body.tradingName || body.trading_name || companyName) || companyName,
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        })
      : await this.prisma.company.create({
          data: {
            aid,
            agid,
            companyId: companyIdValue,
            companyName,
            fullName: this.stringValue(body.fullName || body.full_name || companyName) || companyName,
            tradingName: this.stringValue(body.tradingName || body.trading_name || companyName) || companyName,
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        });

    await this.prisma.companyFilingFlags.upsert({
      where: { cid: record.cid },
      update: {},
      create: { cid: record.cid, includeAssets: true, includeEntities: true, includeFilings: true },
    });

    return { success: true, message: 'Company saved successfully', company: this.toLegacyCompany(record) };
  }

  private async updateCompanyFilingFlags(body: AnyRecord, query: AnyRecord) {
    const cid = this.numberValue(body.cid || body.Cid || query.cid);
    const persistedData = this.cleanDataForPersist(body);
    const existing = await this.prisma.companyFilingFlags.findUnique({ where: { cid } });
    const mergedData = {
      ...this.toRecord(existing?.data),
      ...persistedData,
      incAuth: this.booleanValue(body.incAuth ?? body.IncAuth, false),
      incCS: this.booleanValue(body.incCS ?? body.IncCS, false),
      incMit: this.booleanValue(body.incMit ?? body.IncMit, false),
      incOR: this.booleanValue(body.incOR ?? body.IncOR, false),
      incSL: this.booleanValue(body.incSL ?? body.IncSL, false),
      incEtoE: this.booleanValue(body.incEtoE ?? body.IncEtoE, false),
      incEtoGen: this.booleanValue(body.incEtoGen ?? body.IncEtoGen, false),
      incEtoPPA: this.booleanValue(body.incEtoPPA ?? body.IncEtoPPA, false),
      incEtoVA: this.booleanValue(body.incEtoVA ?? body.IncEtoVA, false),
      incIPSS: this.booleanValue(body.incIPSS ?? body.IncIPSS, false),
      incIMSS: this.booleanValue(body.incIMSS ?? body.IncIMSS, false),
      sandboxTest: this.booleanValue(body.sandboxTest ?? body.SandboxTest, false),
      updatedAt: new Date().toISOString(),
    };
    const record = await this.prisma.companyFilingFlags.upsert({
      where: { cid },
      update: {
        includeAssets: this.booleanValue(body.includeAssets ?? body.IncludeAssets, true),
        includeEntities: this.booleanValue(body.includeEntities ?? body.IncludeEntities, true),
        includeFilings: this.booleanValue(body.includeFilings ?? body.IncludeFilings, true),
        data: mergedData,
      },
      create: {
        cid,
        includeAssets: this.booleanValue(body.includeAssets ?? body.IncludeAssets, true),
        includeEntities: this.booleanValue(body.includeEntities ?? body.IncludeEntities, true),
        includeFilings: this.booleanValue(body.includeFilings ?? body.IncludeFilings, true),
        data: mergedData,
      },
    });

    await this.prisma.company.updateMany({
      where: { cid },
      data: {
        data: {
          ...(this.toRecord((await this.prisma.company.findUnique({ where: { cid } }))?.data)),
          filingFlags: mergedData,
          filingFlagsUpdatedAt: mergedData.updatedAt,
        },
      },
    });

    return {
      success: true,
      message: 'Filing flags updated successfully',
      data: this.toLegacyCompanyFilingFlags(record),
      resultId: record.cid,
      ResultId: record.cid,
    };
  }

  private async saveFiling(body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const fid = this.numberValue(body.fid || body.FID || query.fid || params.p1);
    const persistedData = this.cleanDataForPersist(body);
    const record = fid
      ? await this.prisma.filing.upsert({
          where: { fid },
          update: {
            cid: this.numberValue(body.cid || body.Cid || 1),
            uid: this.optionalNumber(body.uid || body.Uid || body.userId),
            status: this.stringValue(body.status || body.Status || 'Draft') || 'Draft',
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
          create: {
            fid,
            cid: this.numberValue(body.cid || body.Cid || 1),
            uid: this.optionalNumber(body.uid || body.Uid || body.userId),
            status: this.stringValue(body.status || body.Status || 'Draft') || 'Draft',
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        })
      : await this.prisma.filing.create({
          data: {
            cid: this.numberValue(body.cid || body.Cid || 1),
            uid: this.optionalNumber(body.uid || body.Uid || body.userId),
            status: this.stringValue(body.status || body.Status || 'Draft') || 'Draft',
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        });
    return {
      success: true,
      message: 'Filing saved successfully',
      filing: this.decorateRecord('filing', record),
      resultId: record.fid,
      ResultId: record.fid,
    };
  }

  private async listFilings() {
    const records = await this.prisma.filing.findMany({ orderBy: { fid: 'asc' } });
    return records.map((record) => this.decorateRecord('filing', record));
  }

  private async listFilingsByCid(cid: number) {
    const records = await this.prisma.filing.findMany({ where: { ...(cid ? { cid } : {}) }, orderBy: { fid: 'asc' } });
    return records.map((record) => this.decorateRecord('filing', record));
  }

  private async getFilingById(fid: number) {
    const record = await this.prisma.filing.findUnique({ where: { fid } });
    return record ? this.decorateRecord('filing', record) : null;
  }

  private async saveInvoice(body: AnyRecord, query: AnyRecord) {
    const invoiceId = this.numberValue(body.invoiceId || body.InvoiceId || body.id || body.resultId || body.ResultId || query.invoiceId);
    const persistedData = this.cleanDataForPersist(body);
    const record = invoiceId
      ? await this.prisma.invoice.upsert({
          where: { invoiceId },
          update: {
            cid: this.numberValue(body.cid || body.Cid || 1),
            aid: this.numberValue(body.aid || body.Aid || 1),
            agid: this.optionalNumber(body.agid || body.Agid),
            isSent: this.booleanValue(body.isSent, false),
            isBilled: this.booleanValue(body.isBilled, false),
            isPaid: this.booleanValue(body.isPaid, false),
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
          create: {
            invoiceId,
            cid: this.numberValue(body.cid || body.Cid || 1),
            aid: this.numberValue(body.aid || body.Aid || 1),
            agid: this.optionalNumber(body.agid || body.Agid),
            isSent: this.booleanValue(body.isSent, false),
            isBilled: this.booleanValue(body.isBilled, false),
            isPaid: this.booleanValue(body.isPaid, false),
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        })
      : await this.prisma.invoice.create({
          data: {
            cid: this.numberValue(body.cid || body.Cid || 1),
            aid: this.numberValue(body.aid || body.Aid || 1),
            agid: this.optionalNumber(body.agid || body.Agid),
            isSent: this.booleanValue(body.isSent, false),
            isBilled: this.booleanValue(body.isBilled, false),
            isPaid: this.booleanValue(body.isPaid, false),
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        });
    return {
      success: true,
      message: 'Invoice saved successfully',
      invoice: this.decorateRecord('invoice', record),
      resultId: record.invoiceId,
      ResultId: record.invoiceId,
    };
  }

  private async saveMonthlyInvoice(body: AnyRecord, query: AnyRecord) {
    const invoiceId = this.numberValue(body.invoiceId || body.InvoiceId || body.id || body.resultId || body.ResultId || query.invoiceId);
    const persistedData = this.cleanDataForPersist(body);
    const record = invoiceId
      ? await this.prisma.monthlyInvoice.upsert({
          where: { invoiceId },
          update: {
            cid: this.numberValue(body.cid || body.Cid || 1),
            aid: this.numberValue(body.aid || body.Aid || 1),
            agid: this.optionalNumber(body.agid || body.Agid),
            isSent: this.booleanValue(body.isSent, false),
            isBilled: this.booleanValue(body.isBilled, false),
            isPaid: this.booleanValue(body.isPaid, false),
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
          create: {
            invoiceId,
            cid: this.numberValue(body.cid || body.Cid || 1),
            aid: this.numberValue(body.aid || body.Aid || 1),
            agid: this.optionalNumber(body.agid || body.Agid),
            isSent: this.booleanValue(body.isSent, false),
            isBilled: this.booleanValue(body.isBilled, false),
            isPaid: this.booleanValue(body.isPaid, false),
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        })
      : await this.prisma.monthlyInvoice.create({
          data: {
            cid: this.numberValue(body.cid || body.Cid || 1),
            aid: this.numberValue(body.aid || body.Aid || 1),
            agid: this.optionalNumber(body.agid || body.Agid),
            isSent: this.booleanValue(body.isSent, false),
            isBilled: this.booleanValue(body.isBilled, false),
            isPaid: this.booleanValue(body.isPaid, false),
            isActive: this.booleanValue(body.isActive, true),
            data: persistedData,
          },
        });
    return {
      success: true,
      message: 'Monthly invoice saved successfully',
      invoice: this.decorateRecord('monthlyInvoice', record),
      resultId: record.invoiceId,
      ResultId: record.invoiceId,
    };
  }

  private async listInvoicesByCid(cid: number) {
    const records = await this.prisma.invoice.findMany({ where: { ...(cid ? { cid } : {}) }, orderBy: { invoiceId: 'asc' } });
    return records.map((record) => this.decorateRecord('invoice', record));
  }

  private async getInvoiceById(invoiceId: number) {
    const record = await this.prisma.invoice.findUnique({ where: { invoiceId } });
    return record ? this.decorateRecord('invoice', record) : null;
  }

  private async getMonthlyInvoiceById(invoiceId: number) {
    const record = await this.prisma.monthlyInvoice.findUnique({ where: { invoiceId } });
    return record ? this.decorateRecord('monthlyInvoice', record) : null;
  }

  private async getMonthlyInvoiceCount(aid: number, agid: number) {
    const [count, monthlyCount] = await Promise.all([
      this.prisma.invoice.count({ where: { ...(aid ? { aid } : {}), ...(agid ? { agid } : {}) } }),
      this.prisma.monthlyInvoice.count({ where: { ...(aid ? { aid } : {}), ...(agid ? { agid } : {}) } }),
    ]);
    return { aid, agid, invoiceCount: count, monthlyInvoiceCount: monthlyCount };
  }

  private decorateRecord(modelName: string, record: AnyRecord) {
    switch (modelName) {
      case 'user':
        return this.toLegacyUser(record as User);
      case 'role':
        return this.toLegacyRole(record as Role);
      case 'account':
        return this.toLegacyAccount(record);
      case 'accountGroup':
        return this.toLegacyAccountGroup(record);
      case 'company':
        return this.toLegacyCompany(record);
      case 'companyFilingFlags':
        return this.toLegacyCompanyFilingFlags(record);
      case 'invoice':
        return this.toLegacyInvoice(record);
      case 'monthlyInvoice':
        return this.toLegacyMonthlyInvoice(record);
      case 'asset':
        return this.toLegacyAsset(record);
      case 'entity':
        return this.toLegacyEntity(record);
      case 'categoryStatus':
        return this.toLegacyCategoryStatus(record);
      case 'entityToEntity':
      case 'entityToGeneratorAsset':
      case 'entityToPpa':
      case 'entityToVerticalAsset':
      case 'indicativeMarketScreenStudy':
      case 'indicativePowerSupplyStudy':
      case 'mitigation':
      case 'selfLimitation':
      case 'operatingReserve':
      case 'mbrAuthorization':
      case 'imssParameter':
      case 'ipssParameter':
        return this.toLegacyStudyRecord(modelName, record);
      default:
        return { ...record };
    }
  }

  private async markInvoiceSent(invoiceId: number) {
    const result = await this.prisma.invoice.updateMany({ where: { invoiceId }, data: { isSent: true } });
    return { success: true, message: 'Invoice marked sent', count: result.count, resultId: result.count, ResultId: result.count };
  }

  private async updateInvoiceStatus(body: AnyRecord) {
    const invoiceId = this.numberValue(body.invoiceId || body.InvoiceId);
    const result = await this.prisma.invoice.updateMany({
      where: { ...(invoiceId ? { invoiceId } : {}) },
      data: {
        isSent: this.booleanValue(body.isSent, undefined),
        isBilled: this.booleanValue(body.isBilled, undefined),
        isPaid: this.booleanValue(body.isPaid, undefined),
      },
    });
    return { success: true, message: 'Invoice status updated', count: result.count, resultId: result.count, ResultId: result.count };
  }

  private async updateInvoicesBilled(body: AnyRecord) {
    const ids = this.uidList(body.invoiceIds || body.ids || body.invoiceid);
    const result = await this.prisma.invoice.updateMany({
      where: { invoiceId: { in: ids } },
      data: { isBilled: true },
    });
    return { success: true, message: 'Invoices updated', count: result.count, resultId: result.count, ResultId: result.count };
  }

  private async changeInvoiceAccount(aid: number) {
    const result = await this.prisma.invoice.updateMany({ where: { ...(aid ? { aid } : {}) }, data: { aid: aid || 1 } });
    return { success: true, message: 'Invoice account changed', count: result.count, resultId: result.count, ResultId: result.count };
  }

  private toLegacyInvoice(invoice: AnyRecord) {
    const persisted = this.toRecord(invoice?.data);
    return {
      ...persisted,
      ...invoice,
      id: invoice.invoiceId,
      invoiceId: invoice.invoiceId,
      InvoiceId: invoice.invoiceId,
      active: invoice.isActive,
    };
  }

  private toLegacyMonthlyInvoice(invoice: AnyRecord) {
    const persisted = this.toRecord(invoice?.data);
    return {
      ...persisted,
      ...invoice,
      id: invoice.invoiceId,
      invoiceId: invoice.invoiceId,
      InvoiceId: invoice.invoiceId,
      active: invoice.isActive,
    };
  }

  private orderByForModel(modelName: string) {
    switch (modelName) {
      case 'user':
        return { uid: 'asc' };
      case 'role':
        return { gid: 'asc' };
      case 'account':
        return { aid: 'asc' };
      case 'accountGroup':
        return { agid: 'asc' };
      case 'company':
        return { cid: 'asc' };
      case 'asset':
        return { assetid: 'asc' };
      case 'entity':
        return { entityid: 'asc' };
      case 'categoryStatus':
      case 'entityToEntity':
      case 'entityToGeneratorAsset':
      case 'entityToPpa':
      case 'entityToVerticalAsset':
      case 'indicativeMarketScreenStudy':
      case 'indicativePowerSupplyStudy':
      case 'mitigation':
      case 'selfLimitation':
      case 'operatingReserve':
        return { pid: 'asc' };
      case 'mbrAuthorization':
        return { mbrauthid: 'asc' };
      case 'imssParameter':
      case 'ipssParameter':
        return { pid: 'asc' };
      case 'filing':
        return { fid: 'asc' };
      case 'invoice':
      case 'monthlyInvoice':
        return { invoiceId: 'asc' };
      default:
        return { createdAt: 'asc' };
    }
  }

  private idFieldForModel(modelName: string) {
    switch (modelName) {
      case 'user':
        return 'uid';
      case 'role':
        return 'gid';
      case 'account':
        return 'aid';
      case 'accountGroup':
        return 'agid';
      case 'company':
        return 'cid';
      case 'asset':
        return 'assetid';
      case 'entity':
        return 'entityid';
      case 'filing':
        return 'fid';
      case 'invoice':
      case 'monthlyInvoice':
        return 'invoiceId';
      case 'mbrAuthorization':
        return 'mbrauthid';
      case 'imssParameter':
      case 'ipssParameter':
      case 'categoryStatus':
      case 'entityToEntity':
      case 'entityToGeneratorAsset':
      case 'entityToPpa':
      case 'entityToVerticalAsset':
      case 'indicativeMarketScreenStudy':
      case 'indicativePowerSupplyStudy':
      case 'mitigation':
      case 'selfLimitation':
      case 'operatingReserve':
        return 'pid';
      default:
        return 'id';
    }
  }

  private resolveIdValue(modelName: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const idField = this.idFieldForModel(modelName);
    const aliasCandidate = this.idAliasValue(modelName, body);
    const candidate = body?.[idField] ?? body?.[idField.toLowerCase()] ?? aliasCandidate ?? params?.p1 ?? query?.[idField];
    const parsed = Number(candidate);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private idAliasValue(modelName: string, body: AnyRecord) {
    if (!body) return undefined;
    switch (modelName) {
      case 'mbrAuthorization':
        return body.mbr_authorization_id ?? body.mbrauthId ?? body.authId;
      case 'categoryStatus':
        return body.cat_status_id;
      case 'mitigation':
        return body.mitigation_id ?? body.mbr_mitigation_id;
      case 'selfLimitation':
        return body.mbr_self_limitations_id ?? body.mbr_self_limitations_id_fk;
      case 'operatingReserve':
        return body.mbr_operating_reserves_id;
      case 'entityToEntity':
        return body.entities_entities_id;
      case 'entityToGeneratorAsset':
        return body.entities_genassets_id;
      case 'entityToPpa':
        return body.entities_ppas_id;
      case 'entityToVerticalAsset':
        return body.entities_to_vertical_assets_id;
      case 'indicativeMarketScreenStudy':
        return body.indicative_mss_id;
      case 'indicativePowerSupplyStudy':
        return body.indicative_pss_id;
      default:
        return undefined;
    }
  }

  private buildModelData(modelName: string, body: AnyRecord, params: AnyRecord, query: AnyRecord) {
    const cid = this.numberValue(body.cid || body.Cid || query.cid || params.p1);
    const aid = this.numberValue(body.aid || body.Aid || query.aid);
    const gid = this.numberValue(body.gid || body.Gid || query.gid);
    const idField = this.idFieldForModel(modelName);
    const persistedData = this.cleanDataForPersist(body);
    const isActive = body.isActive === undefined ? true : this.booleanValue(body.isActive, true);
    let data: AnyRecord = {
      cid: cid || undefined,
      aid: aid || undefined,
      gid: gid || undefined,
      isActive,
      data: persistedData,
    };

    if (modelName === 'asset') {
      data = {
        ...data,
        name: this.stringValue(body.name || body.genName || body.assetName || body.title || 'Asset') || 'Asset',
        assetName: this.stringValue(body.assetName || body.genName || body.name || body.title || 'Asset') || 'Asset',
        assetid: this.optionalNumber(body.assetid || body.AssetId || body.assetId || body.id) || undefined,
      };
    }

    if (modelName === 'entity') {
      data = {
        ...data,
        name: this.stringValue(body.name || body.entityName || body.title || 'Entity') || 'Entity',
        entityName: this.stringValue(body.entityName || body.name || body.title || 'Entity') || 'Entity',
        entityid: this.optionalNumber(body.entityid || body.EntityId || body.entityId || body.id) || undefined,
      };
    }

    if ([
      'categoryStatus',
      'entityToEntity',
      'entityToGeneratorAsset',
      'entityToPpa',
      'entityToVerticalAsset',
      'indicativeMarketScreenStudy',
      'indicativePowerSupplyStudy',
      'mitigation',
      'selfLimitation',
      'operatingReserve',
    ].includes(modelName)) {
      const resolvedId = this.resolveIdValue(modelName, body, params, query);
      data = {
        ...data,
        pid: resolvedId || undefined,
      };
    }

    if (modelName === 'mbrAuthorization') {
      data = {
        ...data,
        mbrauthid: this.optionalNumber(body.mbrauthid || body.mbrauthId || body.id || params.p1) || undefined,
      };
    }

    if (modelName === 'imssParameter') {
      data = {
        cid: cid || undefined,
        imssId: this.optionalNumber(body.imssId || body.imssID || body.parentId || params.p2) || undefined,
        pid: this.optionalNumber(body.pid || body.PID || body.id) || undefined,
        data: persistedData,
      };
    }

    if (modelName === 'ipssParameter') {
      data = {
        cid: cid || undefined,
        ipssId: this.optionalNumber(body.ipssId || body.ipssID || body.parentId || params.p2) || undefined,
        pid: this.optionalNumber(body.pid || body.PID || body.id) || undefined,
        data: persistedData,
      };
    }

    if (modelName === 'filing') {
      data = {
        cid: cid || undefined,
        uid: this.optionalNumber(body.uid || body.Uid || body.userId) || undefined,
        status: this.stringValue(body.status || body.Status || 'Draft') || 'Draft',
        isActive,
        data: persistedData,
        fid: this.optionalNumber(body.fid || body.FID || body.id || params.p1) || undefined,
      };
    }

    if (modelName === 'invoice' || modelName === 'monthlyInvoice') {
      data = {
        cid: cid || undefined,
        aid: aid || undefined,
        agid: this.optionalNumber(body.agid || body.Agid) || undefined,
        isSent: this.booleanValue(body.isSent, false),
        isBilled: this.booleanValue(body.isBilled, false),
        isPaid: this.booleanValue(body.isPaid, false),
        isActive,
        data: persistedData,
        invoiceId: this.optionalNumber(body.invoiceId || body.InvoiceId || body.id || params.p1) || undefined,
      };
    }

    if (modelName === 'company') {
      data = {
        ...data,
        companyId: this.stringValue(body.companyId || body.company_id || '') || null,
        companyName: this.stringValue(body.companyName || body.CompanyName || body.fullName || 'Company') || 'Company',
        fullName: this.stringValue(body.fullName || body.full_name || this.stringValue(body.companyName || body.CompanyName || body.fullName || 'Company')) || this.stringValue(body.companyName || body.CompanyName || body.fullName || 'Company'),
        tradingName: this.stringValue(body.tradingName || body.trading_name || this.stringValue(body.companyName || body.CompanyName || body.fullName || 'Company')) || this.stringValue(body.companyName || body.CompanyName || body.fullName || 'Company'),
      };
    }

    if (modelName === 'account') {
      data = {
        ...data,
        name: this.stringValue(body.name || body.accName || body.accountName || 'Account') || 'Account',
        accName: this.stringValue(body.accName || body.accountName || body.name || 'Account') || this.stringValue(body.name || body.accName || body.accountName || 'Account') || 'Account',
        accountName: this.stringValue(body.accountName || body.accName || body.name || 'Account') || this.stringValue(body.name || body.accName || body.accountName || 'Account') || 'Account',
        url: this.stringValue(body.url || body.Url || '') || null,
      };
    }

    if (modelName === 'accountGroup') {
      data = {
        ...data,
        name: this.stringValue(body.name || body.groupname || 'Default Group') || 'Default Group',
        groupname: this.stringValue(body.groupname || body.name || this.stringValue(body.name || body.groupname || 'Default Group')) || this.stringValue(body.name || body.groupname || 'Default Group'),
      };
    }

    data[idField] = this.resolveIdValue(modelName, body, params, query) || data[idField];
    return this.stripUndefined(data);
  }

  private extractParamList(body: AnyRecord) {
    if (Array.isArray(body?.parameters)) return body.parameters;
    if (Array.isArray(body?.params)) return body.params;
    if (Array.isArray(body?.records)) return body.records;
    return [];
  }

  private cleanDataForPersist(body: AnyRecord) {
    const clone = { ...body };
    delete clone.password;
    delete clone.Password;
    delete clone.token;
    delete clone.refreshToken;
    delete clone.access_token;
    delete clone.accessToken;
    return clone;
  }

  private stripUndefined(value: AnyRecord) {
    return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
  }

  private async copyEntityData(body: AnyRecord) {
    const sourceCid = this.numberValue(body.cid || body.copyFromCID || body.copyFromCid || body.sourceCid || body.sourceCID || 0);
    const targetCid = this.numberValue(body.copyToCID || body.targetCid || body.targetCID || body.toCid || 0);

    if (!sourceCid || !targetCid) {
      return {
        success: false,
        message: 'Source CID and target CID are required',
        sourceCid,
        targetCid,
      };
    }

    if (sourceCid === targetCid) {
      return {
        success: false,
        message: 'Source CID and target CID must be different',
        sourceCid,
        targetCid,
      };
    }

    const result = {
      company: 0,
      companyFilingFlags: 0,
      assets: 0,
      entities: 0,
      filings: 0,
      categoryStatus: 0,
      entityToEntity: 0,
      entityToGeneratorAsset: 0,
      entityToPpa: 0,
      entityToVerticalAsset: 0,
      indicativeMarketScreenStudy: 0,
      indicativePowerSupplyStudy: 0,
      mbrAuthorization: 0,
      mitigation: 0,
      selfLimitation: 0,
      operatingReserve: 0,
    };

    const sourceCompany = await this.prisma.company.findUnique({ where: { cid: sourceCid } });
    if (sourceCompany) {
      await this.saveCompany({ ...sourceCompany, cid: targetCid, id: undefined }, { p1: targetCid }, { cid: targetCid });
      result.company = 1;
    }

    const sourceFlags = await this.prisma.companyFilingFlags.findUnique({ where: { cid: sourceCid } });
    if (sourceFlags) {
      await this.updateCompanyFilingFlags(
        {
          cid: targetCid,
          includeAssets: sourceFlags.includeAssets,
          includeEntities: sourceFlags.includeEntities,
          includeFilings: sourceFlags.includeFilings,
          data: sourceFlags.data,
        },
        { cid: targetCid },
      );
      result.companyFilingFlags = 1;
    }

    const copyableModels: Array<[string, keyof typeof result]> = [
      ['asset', 'assets'],
      ['entity', 'entities'],
      ['filing', 'filings'],
      ['categoryStatus', 'categoryStatus'],
      ['entityToEntity', 'entityToEntity'],
      ['entityToGeneratorAsset', 'entityToGeneratorAsset'],
      ['entityToPpa', 'entityToPpa'],
      ['entityToVerticalAsset', 'entityToVerticalAsset'],
      ['indicativeMarketScreenStudy', 'indicativeMarketScreenStudy'],
      ['indicativePowerSupplyStudy', 'indicativePowerSupplyStudy'],
      ['mbrAuthorization', 'mbrAuthorization'],
      ['mitigation', 'mitigation'],
      ['selfLimitation', 'selfLimitation'],
      ['operatingReserve', 'operatingReserve'],
    ];

    for (const [modelName, resultKey] of copyableModels) {
      const records = await this.listModelRecords(modelName, { cid: sourceCid });
      for (const record of records) {
        const payload = this.prepareCopyPayload(modelName, record, targetCid);
        if (!payload) continue;
        await this.saveModelRecord(modelName, payload, {}, {});
        result[resultKey] += 1;
      }
    }

    return {
      success: true,
      message: 'Data copy completed successfully',
      sourceCid,
      targetCid,
      counts: result,
    };
  }

  private prepareCopyPayload(modelName: string, record: AnyRecord, targetCid: number) {
    const merged: AnyRecord = { ...this.toRecord(record), ...this.toRecord(record?.data), cid: targetCid };
    const idField = this.idFieldForModel(modelName);
    delete merged.id;
    delete merged.createdAt;
    delete merged.updatedAt;
    delete merged.resultId;
    delete merged.ResultId;
    delete merged.active;
    delete merged[idField];
    if (modelName === 'filing') {
      delete merged.fid;
    }
    return merged;
  }

  private buildXmlPayload(cid: number, records: AnyRecord[] = []) {
    const recordXml = records
      .map((record) => `<record>${Object.entries(record || {})
        .map(([key, value]) => `<${key}>${this.escapeXml(String(value ?? ''))}</${key}>`)
        .join('')}</record>`)
      .join('');

    return `<root><cid>${cid}</cid>${recordXml}</root>`;
  }

  private buildPdfPayload(cid: number) {
    return {
      success: true,
      cid,
      generatedAt: new Date().toISOString(),
      format: 'pdf-data',
    };
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private toLegacyUser(user: User) {
    const names = this.splitUserName(user.name);
    const extras = this.userProfileExtras.get(user.uid) || {};

    return {
      id: user.uid,
      uid: user.uid,
      Uid: user.uid,
      userId: user.uid,
      name: user.name,
      UserName: user.name,
      fullName: user.name,
      firstName: names.firstName,
      FirstName: names.firstName,
      first_name: names.firstName,
      fname: names.firstName,
      Fname: names.firstName,
      lastName: names.lastName,
      LastName: names.lastName,
      last_name: names.lastName,
      lname: names.lastName,
      Lname: names.lastName,
      email: user.email,
      Email: user.email,
      eMail: user.email,
      phone: extras.phone ?? extras.workPhone ?? extras.work_phone ?? '',
      Phone: extras.phone ?? extras.workPhone ?? extras.work_phone ?? '',
      workPhone: extras.workPhone ?? extras.phone ?? extras.work_phone ?? '',
      WorkPhone: extras.workPhone ?? extras.phone ?? extras.work_phone ?? '',
      work_phone: extras.work_phone ?? extras.workPhone ?? extras.phone ?? '',
      mobile: extras.mobile ?? extras.mobilePhone ?? extras.mobile_phone ?? '',
      Mobile: extras.mobile ?? extras.mobilePhone ?? extras.mobile_phone ?? '',
      mobilePhone: extras.mobilePhone ?? extras.mobile ?? extras.mobile_phone ?? '',
      MobilePhone: extras.mobilePhone ?? extras.mobile ?? extras.mobile_phone ?? '',
      mobile_phone: extras.mobile_phone ?? extras.mobilePhone ?? extras.mobile ?? '',
      role: user.role,
      rolename: user.role,
      gid: user.gid,
      Gid: user.gid,
      aid: user.aid,
      Aid: user.aid,
      cid: user.cid,
      Cid: user.cid,
      active: user.isActive,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private rememberUserProfileExtras(uid: number, body: AnyRecord) {
    if (!uid) return;

    const existing = this.userProfileExtras.get(uid) || {};
    const next = {
      ...existing,
      phone: this.stringValue(body.phone || body.Phone || existing.phone || ''),
      workPhone: this.stringValue(body.workPhone || body.WorkPhone || body.work_phone || body.phone || body.Phone || existing.workPhone || ''),
      work_phone: this.stringValue(body.work_phone || body.workPhone || body.phone || body.Phone || existing.work_phone || ''),
      mobile: this.stringValue(body.mobile || body.Mobile || body.mobilePhone || body.MobilePhone || body.mobile_phone || existing.mobile || ''),
      mobilePhone: this.stringValue(body.mobilePhone || body.MobilePhone || body.mobile || body.Mobile || body.mobile_phone || existing.mobilePhone || ''),
      mobile_phone: this.stringValue(body.mobile_phone || body.mobilePhone || body.mobile || body.Mobile || existing.mobile_phone || ''),
    };

    this.userProfileExtras.set(uid, next);
  }

  private toLegacyRole(role: Role) {
    return {
      id: role.gid,
      gid: role.gid,
      Gid: role.gid,
      value: role.gid,
      text: role.rolename,
      name: role.name,
      rolename: role.rolename,
      roleName: role.rolename,
      active: role.isActive,
      isActive: role.isActive,
    };
  }

  private toLegacyAccount(account: AnyRecord) {
    const persisted = this.toRecord(account?.data);
    return {
      ...persisted,
      ...account,
      id: account.aid,
      aid: account.aid,
      AID: account.aid,
      Account: account.name,
      accName: account.accName || account.name,
      accountName: account.accountName || account.name,
      active: account.isActive,
    };
  }

  private toLegacyAccountGroup(group: AnyRecord) {
    return {
      ...group,
      id: group.agid,
      agid: group.agid,
      AGID: group.agid,
      value: group.agid,
      text: group.groupname || group.name,
      name: group.name || group.groupname,
      groupname: group.groupname || group.name,
      active: group.isActive,
    };
  }

  private toLegacyCompany(company: AnyRecord) {
    const persisted = this.toRecord(company?.data);
    return {
      ...persisted,
      ...company,
      id: company.cid,
      cid: company.cid,
      CID: company.cid,
      company_id: company.companyId,
      companyName: company.companyName || company.fullName || company.tradingName,
      CompanyName: company.companyName || company.fullName || company.tradingName,
      full_name: company.fullName || company.companyName || company.tradingName,
      trading_name: company.tradingName || company.fullName || company.companyName,
      Title: company.companyName || company.fullName || company.tradingName,
      title: company.companyName || company.fullName || company.tradingName,
      active: company.isActive,
    };
  }

  private toRecord(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...(value as AnyRecord) } : {};
  }

  private mergePersistedRecord(record: AnyRecord) {
    const persisted = this.toRecord(record?.data);
    return {
      ...persisted,
      ...record,
    };
  }

  private toLegacyAsset(record: AnyRecord) {
    const merged = this.mergePersistedRecord(record);
    return {
      ...merged,
      id: merged.assetid,
      assetid: merged.assetid,
      AssetId: merged.assetid,
      genCode: merged.genCode || merged.gen_code || merged.genCode || '',
      gen_code: merged.gen_code || merged.genCode || '',
      genName: merged.genName || merged.Gen_name || merged.gen_name || merged.assetName || merged.name || '',
      name: merged.name || merged.genName || merged.assetName || '',
      state: merged.state || merged.State || '',
      country: merged.country || merged.Country || '',
      capacity: merged.capacity || merged.nameplate_capacity_mw || '',
      opMonth: merged.opMonth || merged.operating_month || '',
      opYear: merged.opYear || merged.operating_year || '',
      active: merged.isActive,
    };
  }

  private toLegacyEntity(record: AnyRecord) {
    const merged = this.mergePersistedRecord(record);
    return {
      ...merged,
      id: merged.entityid,
      entityid: merged.entityid,
      EntityId: merged.entityid,
      entityName: merged.entityName || merged.name || '',
      name: merged.name || merged.entityName || '',
      active: merged.isActive,
    };
  }

  private toLegacyCategoryStatus(record: AnyRecord) {
    const merged = this.mergePersistedRecord(record);
    const regionCd = merged.region_cd ?? merged.region ?? '';
    const statusFk = merged.cat_status_in_region_fk ?? merged.catStatusInRegionFk ?? merged.categoryStatus ?? merged.category_status ?? '';
    return {
      ...merged,
      id: merged.pid,
      pid: merged.pid,
      PID: merged.pid,
      gid: merged.gid,
      cat_status_id: merged.cat_status_id ?? merged.catStatusId ?? null,
      cat_status_in_region_fk: statusFk,
      cat_status_in_region_desc: merged.cat_status_in_region_desc ?? merged.categoryStatusText ?? this.categoryStatusText(statusFk),
      region_cd: regionCd,
      region_desc: merged.region_desc ?? merged.regionName ?? this.regionText(regionCd),
      cat_status_effective_date: merged.cat_status_effective_date ?? merged.effectiveDate ?? '',
      cat_status_effective_date1: merged.cat_status_effective_date1 ?? merged.cat_status_effective_date ?? merged.effectiveDate ?? '',
      record_type_cd: merged.record_type_cd ?? merged.recordType ?? 'New',
      reference_id: merged.reference_id ?? null,
      active: merged.isActive,
    };
  }

  private toLegacyStudyRecord(modelName: string, record: AnyRecord) {
    const merged = this.mergePersistedRecord(record);
    const idField = this.idFieldForModel(modelName);
    const idValue = merged[idField] ?? merged.pid ?? merged.mbrauthid ?? merged.id;
    const balancingAuthority = merged.balancing_Authority_cd ?? merged.Balancing_Authority_cd ?? merged.balancing_authority_cd ?? merged.balancingAuthority ?? '';
    const base: AnyRecord = {
      ...merged,
      id: idValue,
      pid: merged.pid ?? idValue,
      active: merged.isActive,
      gid: merged.gid,
      record_type_cd: merged.record_type_cd ?? merged.recordType ?? merged.recordTypeCd ?? 'New',
      reference_id: merged.reference_id ?? merged.referenceId ?? null,
      mbr_submission_fk: merged.mbr_submission_fk ?? merged.fercId ?? '',
      active_date: merged.active_date ?? merged.activeDate ?? null,
      inactive_date: merged.inactive_date ?? merged.inactiveDate ?? null,
      IncInFiling: merged.IncInFiling ?? merged.incInFiling ?? false,
      balancing_Authority_cd: balancingAuthority,
      Balancing_Authority_cd: balancingAuthority,
      balancing_authority_cd: balancingAuthority,
      baa_desc: merged.baa_desc ?? merged.balancingAuthorityDesc ?? balancingAuthority,
    };

    if (modelName === 'mbrAuthorization') {
      return {
        ...base,
        mbr_authorization_id: merged.mbr_authorization_id ?? merged.mbrauthid ?? idValue,
        mbrauthid: merged.mbrauthid ?? idValue,
        authorization_docket_number: merged.authorization_docket_number ?? merged.authDocker ?? '',
        authorization_docket: merged.authorization_docket ?? merged.authorization_docket_number ?? '',
        authorization_effective_date: merged.authorization_effective_date ?? merged.authEffectiveDate ?? '',
        authorization_effective_date1: merged.authorization_effective_date1 ?? merged.authorization_effective_date ?? merged.authEffectiveDate ?? '',
        cancellation_docket_number: merged.cancellation_docket_number ?? merged.cancellationDocker ?? '',
        cancellation_effective_date: merged.cancellation_effective_date ?? merged.cancellationEffectiveDate ?? '',
        record_type_cd: merged.record_type_cd ?? merged.recordType ?? 'New',
        reference_id: merged.reference_id ?? null,
        active_date: merged.active_date ?? merged.activeDate ?? null,
        inactive_date: merged.inactive_date ?? merged.inactiveDate ?? null,
      };
    }

    if (modelName === 'imssParameter' || modelName === 'ipssParameter') {
      return {
        ...base,
        imssId: merged.imssId ?? merged.parentId ?? null,
        ipssId: merged.ipssId ?? merged.parentId ?? null,
      };
    }

    if (modelName === 'mitigation') {
      return {
        ...base,
        mitigation_narrative: merged.mitigation_narrative ?? merged.mitigationNarrative ?? merged.narrative ?? '',
        mitigation_effective_date: merged.mitigation_effective_date ?? merged.effectiveDate ?? '',
        mitigation_effective_date1: merged.mitigation_effective_date1 ?? merged.mitigation_effective_date ?? merged.effectiveDate ?? '',
        mitigation_end_date: merged.mitigation_end_date ?? merged.endDate ?? '',
        mitigation_end_date1: merged.mitigation_end_date1 ?? merged.mitigation_end_date ?? merged.endDate ?? '',
      };
    }

    if (modelName === 'selfLimitation') {
      return {
        ...base,
        region_cd: merged.region_cd ?? merged.region ?? '',
        region_desc: merged.region_desc ?? this.regionText(merged.region_cd ?? merged.region ?? ''),
        self_limit_effective_date: merged.self_limit_effective_date ?? merged.effectiveDate ?? '',
        self_limit_effective_date1: merged.self_limit_effective_date1 ?? merged.self_limit_effective_date ?? merged.effectiveDate ?? '',
        self_limit_end_date: merged.self_limit_end_date ?? merged.endDate ?? '',
        self_limit_end_date1: merged.self_limit_end_date1 ?? merged.self_limit_end_date ?? merged.endDate ?? '',
        mbr_self_limitations_id: merged.mbr_self_limitations_id ?? idValue,
      };
    }

    if (modelName === 'operatingReserve') {
      return {
        ...base,
        mbr_operating_reserves_id: merged.mbr_operating_reserves_id ?? idValue,
        or_authorization_effective_date: merged.or_authorization_effective_date ?? merged.effectiveDate ?? '',
        or_authorization_effective_date1: merged.or_authorization_effective_date1 ?? merged.or_authorization_effective_date ?? merged.effectiveDate ?? '',
        or_authorization_end_date: merged.or_authorization_end_date ?? merged.endDate ?? '',
        or_authorization_end_date1: merged.or_authorization_end_date1 ?? merged.or_authorization_end_date ?? merged.endDate ?? '',
      };
    }

    if (modelName === 'indicativeMarketScreenStudy' || modelName === 'indicativePowerSupplyStudy') {
      return {
        ...base,
        indicative_mss_id: merged.indicative_mss_id ?? idValue,
        indicative_pss_id: merged.indicative_pss_id ?? idValue,
        study_type_cd: merged.study_type_cd ?? merged.studyTypeCd ?? merged.record_type_cd ?? 'New',
        Study_type_cd: merged.study_type_cd ?? merged.studyTypeCd ?? merged.record_type_cd ?? 'New',
        study_end_year: merged.study_end_year ?? merged.studyEndYear ?? '',
        Study_end_year: merged.study_end_year ?? merged.studyEndYear ?? '',
        study_area_balancing_authority_cd: merged.study_area_balancing_authority_cd ?? merged.studyAreaBalancingAuthorityCd ?? '',
        study_area_balancing_authority: merged.study_area_balancing_authority ?? merged.studyAreaBalancingAuthority ?? merged.study_area_balancing_authority_cd ?? '',
        Study_area_balancing_authority: merged.Study_area_balancing_authority ?? merged.study_area_balancing_authority ?? merged.studyAreaBalancingAuthority ?? merged.study_area_balancing_authority_cd ?? '',
        scenario_type: merged.scenario_type ?? merged.scenarioType ?? '',
        scenario_type_desc: merged.scenario_type_desc ?? merged.scenarioTypeDesc ?? merged.scenario_type ?? '',
        Scenario_type_desc: merged.scenario_type_desc ?? merged.scenarioTypeDesc ?? merged.scenario_type ?? '',
        study_parameters_count: merged.study_parameters_count ?? merged.Total ?? merged.total ?? 0,
      };
    }

    return base;
  }

  private regionText(value: unknown) {
    const key = String(value ?? '').trim().toUpperCase();
    const regions: Record<string, string> = {
      CE: 'Central',
      CENTRAL: 'Central',
      NE: 'Northeast',
      NORTHEAST: 'Northeast',
      NW: 'Northwest',
      NORTHWEST: 'Northwest',
      SE: 'Southeast',
      SOUTHEAST: 'Southeast',
      SPP: 'Southwest Power Pool',
      SW: 'Southwest',
      SOUTHWEST: 'Southwest',
    };
    return regions[key] || String(value ?? '');
  }

  private categoryStatusText(value: unknown) {
    const key = String(value ?? '').trim();
    const statuses: Record<string, string> = {
      '1': 'Category 1',
      '2': 'Category 2',
      '3': 'No MBR authority in the region',
    };
    return statuses[key] || String(value ?? '');
  }

  private toLegacyCompanyFilingFlags(flags: AnyRecord) {
    const persisted = this.toRecord(flags?.data);
    const flagValue = (key: string) => persisted[key] ?? persisted[key.charAt(0).toUpperCase() + key.slice(1)] ?? false;
    return {
      ...persisted,
      ...flags,
      id: flags.cid,
      cid: flags.cid,
      includeAssets: flags.includeAssets,
      includeEntities: flags.includeEntities,
      includeFilings: flags.includeFilings,
      incAuth: flagValue('incAuth'),
      IncAuth: flagValue('incAuth'),
      incCS: flagValue('incCS'),
      IncCS: flagValue('incCS'),
      incMit: flagValue('incMit'),
      IncMit: flagValue('incMit'),
      incOR: flagValue('incOR'),
      IncOR: flagValue('incOR'),
      incSL: flagValue('incSL'),
      IncSL: flagValue('incSL'),
      incEtoE: flagValue('incEtoE'),
      IncEtoE: flagValue('incEtoE'),
      incEtoGen: flagValue('incEtoGen'),
      IncEtoGen: flagValue('incEtoGen'),
      incEtoPPA: flagValue('incEtoPPA'),
      IncEtoPPA: flagValue('incEtoPPA'),
      incEtoVA: flagValue('incEtoVA'),
      IncEtoVA: flagValue('incEtoVA'),
      incIPSS: flagValue('incIPSS'),
      IncIPSS: flagValue('incIPSS'),
      incIMSS: flagValue('incIMSS'),
      IncIMSS: flagValue('incIMSS'),
      sandboxTest: persisted.sandboxTest ?? persisted.SandboxTest ?? false,
      filingSelections: persisted.filingSelections ?? persisted.FilingSelections ?? {},
    };
  }

  private async persistCompanyFilingFlagState(cid: number, state: AnyRecord) {
    const updatedAt = state.updatedAt || new Date().toISOString();
    const selection = {
      table: state.table,
      tableId: state.tableId,
      value: state.value,
      whereIds: state.whereIds,
      updateAll: Boolean(state.updateAll),
      count: this.numberValue(state.count),
      updatedAt,
      updatedBy: state.updatedBy ?? null,
    };

    const company = await this.prisma.company.findUnique({ where: { cid } });
    if (company) {
      await this.prisma.company.update({
        where: { cid },
        data: {
          data: {
            ...this.toRecord(company.data),
            filingSelections: {
              ...(this.toRecord(company.data)?.filingSelections || {}),
              [this.normalizeFilingFlagTable(state.table)]: selection,
            },
            filingFlagsUpdatedAt: updatedAt,
          },
        },
      });
    }

    await this.prisma.companyFilingFlags.upsert({
      where: { cid },
      update: {
        data: {
          ...(this.toRecord((await this.prisma.companyFilingFlags.findUnique({ where: { cid } }))?.data)),
          filingSelections: {
            ...(this.toRecord((await this.prisma.companyFilingFlags.findUnique({ where: { cid } }))?.data)?.filingSelections || {}),
            [this.normalizeFilingFlagTable(state.table)]: selection,
          },
          filingFlagsUpdatedAt: updatedAt,
        },
      },
      create: {
        cid,
        includeAssets: true,
        includeEntities: true,
        includeFilings: true,
        data: {
          filingSelections: {
            [this.normalizeFilingFlagTable(state.table)]: selection,
          },
          filingFlagsUpdatedAt: updatedAt,
        },
      },
    });
  }

  private normalizeFilingFlagTable(table: string) {
    return (table || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private modelForFilingFlagTable(table: string) {
    const normalized = this.normalizeFilingFlagTable(table);
    const mapping: Record<string, string> = {
      tblasset: 'asset',
      asset: 'asset',
      mbrcategorystatus: 'categoryStatus',
      categorystatus: 'categoryStatus',
      mbrmitigations: 'mitigation',
      mitigation: 'mitigation',
      mbrselflimitations: 'selfLimitation',
      selflimitation: 'selfLimitation',
      mbroperatingreserves: 'operatingReserve',
      operatingreserve: 'operatingReserve',
      mbr_operatingreserves: 'operatingReserve',
      entities_to_entities: 'entityToEntity',
      entitiestoentities: 'entityToEntity',
      entities_to_generator_assets: 'entityToGeneratorAsset',
      entitiestogeneratorassets: 'entityToGeneratorAsset',
      entities_to_ppas: 'entityToPpa',
      entitiestoppas: 'entityToPpa',
      entities_to_vertical_assets: 'entityToVerticalAsset',
      entitiestoverticalassets: 'entityToVerticalAsset',
      indicativemss: 'indicativeMarketScreenStudy',
      imss: 'indicativeMarketScreenStudy',
      indicativepss: 'indicativePowerSupplyStudy',
      ipss: 'indicativePowerSupplyStudy',
      mbrauthorizations: 'mbrAuthorization',
      mbrauth: 'mbrAuthorization',
      mbr_authorizations: 'mbrAuthorization',
    };
    return mapping[normalized] || null;
  }

  private normalize(value: string) {
    return (value || '').toLowerCase();
  }

  private isListAction(action: string) {
    return action.includes('list') || action.includes('filings') || action.includes('invoice');
  }

  private isXmlAction(action: string) {
    return action.includes('xml');
  }

  private isSaveAction(action: string) {
    return action.includes('insupd') || action.includes('update') || action.includes('save');
  }

  private isCreateAction(action: string) {
    return action.includes('create');
  }

  private isCopyAction(action: string) {
    return action.includes('copy');
  }

  private roleName(gid: number) {
    return this.prisma.role.findUnique({ where: { gid } }).then((role) => role?.rolename || fallbackRoles.find((item) => item.gid === gid)?.rolename || 'Company User');
  }

  private async getBalancingAuthorityDropdown(valueField: string, textField: string) {
    const lookups = await this.prisma.commonLookup.findMany({
      where: {
        table: { in: ['lookbaa', 'balancingAuthority', 'balancing_authority'] },
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    const records = lookups.length
      ? lookups
      : [
          { value: 'PJM', text: 'PJM Interconnection', id: 'PJM' },
          { value: 'MISO', text: 'Midcontinent ISO', id: 'MISO' },
          { value: 'CAISO', text: 'California ISO', id: 'CAISO' },
          { value: 'ERCOT', text: 'Electric Reliability Council of Texas', id: 'ERCOT' },
          { value: 'SPP', text: 'Southwest Power Pool', id: 'SPP' },
          { value: 'NYISO', text: 'New York ISO', id: 'NYISO' },
          { value: 'ISONE', text: 'ISO New England', id: 'ISONE' },
        ];

    return records.map((record: AnyRecord) => {
      const value = String(record[valueField] ?? record.value ?? record.ID ?? record.id ?? '').trim();
      const text = String(record[textField] ?? record.text ?? record.baa_desc ?? record.name ?? value).trim();
      return {
        ...record,
        value,
        text,
        ID: value,
        baa_desc: text,
      };
    });
  }

  private async getRoleTypes() {
    const dbRoles = await this.prisma.role.findMany({
      where: { isActive: true },
      orderBy: { gid: 'asc' },
    });
    return dbRoles.length ? dbRoles.map((role) => this.toLegacyRole(role)) : fallbackRoles;
  }

  private splitUserName(name: string) {
    const parts = this.stringValue(name).split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || '',
      lastName: parts.length > 1 ? parts.slice(1).join(' ') : '',
    };
  }

  private booleanValue(value: any, fallback: boolean | undefined = false) {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
    return fallback;
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
  }

  private numberValue(value: unknown) {
    const parsed = Number(value || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private optionalNumber(value: unknown) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private uidList(value: unknown) {
    if (Array.isArray(value)) {
      return value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0);
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) && value > 0 ? [value] : [];
    }
    if (typeof value !== 'string') {
      return [];
    }
    return value.split(',').map((item) => Number(item.trim())).filter((item) => Number.isFinite(item) && item > 0);
  }
}
