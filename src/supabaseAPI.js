class SupabaseClient {
  constructor(url, key, schema = 'public') {
    this.url = (url || CONFIG.DATABASE.dbUrl).replace(/\/$/, '') + '/rest/v1';
    this.key = key || CONFIG.DATABASE.dbKey;
    this.schema = schema;

    if (!this.url || !this.key) {
      throw new Error('Supabase URL and Key must be provided.');
    }
  }

  from(tableName) {
    return new SupabaseQuery(this.url, this.key, this.schema, tableName);
  }
}

class SupabaseQuery {
  constructor(baseUrl, key, schema, tableName, queryParams = [], headers = null) {
    this.baseUrl = baseUrl;
    this.key = key;
    this.schema = schema;
    this.tableName = tableName;
    this.url = `${baseUrl}/${tableName}`;
    this.queryParams = queryParams;
    this.headers = headers || {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Accept-Profile': schema,
      'Content-Profile': schema
    };
  }

  _clone() {
    return new SupabaseQuery(
      this.baseUrl, 
      this.key, 
      this.schema, 
      this.tableName, 
      [...this.queryParams], 
      { ...this.headers }
    );
  }

  _fetch(url, options) {
    options.muteHttpExceptions = true;
    try {
      const res = UrlFetchApp.fetch(url, options);
      const code = res.getResponseCode();
      const text = res.getContentText();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch (_) { body = text; }

      return {
        data: code >= 200 && code < 300 ? body : null,
        error: code >= 300 ? { status: code, body } : null
      };
    } catch (e) {
      return { data: null, error: e.toString() };
    }
  }

  eq(column, value) {
    const q = this._clone();
    q.queryParams.push(`${column}=eq.${encodeURIComponent(value)}`);
    return q;
  }

  gt(column, value) {
    const q = this._clone();
    q.queryParams.push(`${column}=gt.${encodeURIComponent(value)}`);
    return q;
  }

  lt(column, value) {
    const q = this._clone();
    q.queryParams.push(`${column}=lt.${encodeURIComponent(value)}`);
    return q;
  }

  ilike(column, pattern) {
    const q = this._clone();
    q.queryParams.push(`${column}=ilike.${encodeURIComponent(pattern)}`);
    return q;
  }

  in(column, values) {
    const q = this._clone();
    const vals = values.map(v => encodeURIComponent(v)).join(',');
    q.queryParams.push(`${column}=in.(${vals})`);
    return q;
  }

  or(expression) {
    const q = this._clone();
    q.queryParams.push(`or=(${expression})`);
    return q;
  }

  order(columnOrObj, ascending = true) {
    const q = this._clone();
    if (typeof columnOrObj === 'object') {
      Object.keys(columnOrObj).forEach(col => {
        q.queryParams.push(`order=${col}.${columnOrObj[col] ? 'asc' : 'desc'}`);
      });
    } else {
      q.queryParams.push(`order=${columnOrObj}.${ascending ? 'asc' : 'desc'}`);
    }
    return q;
  }

  limit(count) {
    const q = this._clone();
    q.queryParams.push(`limit=${count}`);
    return q;
  }

  single() {
    const q = this._clone();
    q.headers['Accept'] = 'application/vnd.pgrst.object+json';
    return q;
  }

  select(columns = '*') {
    const q = this._clone();
    q.queryParams.unshift(`select=${encodeURIComponent(columns)}`);
    const url = `${q.url}?${q.queryParams.join('&')}`;
    return q._fetch(url, { method: 'get', headers: q.headers });
  }

  insert(data) {
    return this._fetch(this.url, {
      method: 'post',
      payload: JSON.stringify(data),
      headers: { ...this.headers, 'Prefer': 'return=representation' }
    });
  }

  update(data) {
    const url = `${this.url}?${this.queryParams.join('&')}`;
    return this._fetch(url, {
      method: 'patch',
      payload: JSON.stringify(data),
      headers: { ...this.headers, 'Prefer': 'return=representation' }
    });
  }

  delete() {
    const url = `${this.url}?${this.queryParams.join('&')}`;
    return this._fetch(url, {
      method: 'delete',
      headers: this.headers
    });
  }
}