using Lucca.CSharpSDK.Domain;
using Lucca.CSharpSDK.Infra.Common;
using Lucca.CSharpSDK.Infra.Extensions;
using Newtonsoft.Json;
using RDD.Domain;
using RDD.Domain.Contexts;
using RDD.Domain.Exceptions;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Cache;

namespace Lucca.CSharpSDK.Infra.v2
{
	public abstract class ApiService<TEntity> : IApiService<TEntity>
		where TEntity : class, IEntityBase
	{
		protected ApiSettings _settings { get; set; }
		protected Uri _baseUri { get; set; }

		public ApiService(ApiSettings settings)
		{
			_settings = settings;
		}

		public IEnumerable<TEntity> Get(Query<TEntity> query)
		{
			using (var wc = Resolver.Current().Resolve<IWebClientFactory>().Create())
			{
				// Disable cache
				wc.CachePolicy = new RequestCachePolicy(RequestCacheLevel.NoCacheNoStore);

				foreach (var key in query.Headers.RawHeaders.AllKeys)
				{
					wc.Headers.Add(key, query.Headers.RawHeaders[key]);
				}
				wc.Headers.Add("Authorization", String.Format("Lucca {0}={1}", _settings.AuthenticationInfo.Type.ToString().ToLower(), _settings.AuthenticationInfo.Token));

				var logger = Resolver.Current().Resolve<ILogService>();

				//Serialize query
				var queryString = query.Serialize();
				var uri = String.IsNullOrEmpty(queryString) ? _baseUri.ToString() : String.Format("{0}?{1}", _baseUri, queryString);

				try
				{
					// Retrieve JSON
					logger.Log(LogLevel.DEBUG, "GET {0}", uri);

					var json = wc.DownloadString(uri);

					logger.Log(LogLevel.DEBUG, "Lucca response = {0}", json);

					// Parse
					var response = JsonConvert.DeserializeObject<ApiResponse<TEntity>>(json);

					if (!String.IsNullOrEmpty(response.Message))
					{
						logger.Log(LogLevel.ERROR, "GET {0}; response = {1}", uri, json);

						throw new HttpLikeException((HttpStatusCode)response.Status, response.Message);
					}

					return response.Data;
				}
				catch (WebException e)
				{
					// Do NOT throw exception with URL in message as URL contains token
					logger.Log(LogLevel.CRITICAL, "Unable to GET {0}. InnerException = {1}", uri, e.Message);

					throw e;
				}
			}
		}

		public IEnumerable<TEntity> GetAll()
		{
			return GetAll(new Query<TEntity>());
		}

		public IEnumerable<TEntity> GetAll(Query<TEntity> query)
		{
			return Get(query);
		}

		public TEntity GetById(string uri) { return GetById(uri, new Query<TEntity>()); }
		public TEntity GetById(string uri, Query<TEntity> query) { throw new NotImplementedException(); }

		public TEntity Post(TEntity entity) { return Post(entity, new Query<TEntity>()); }
		public TEntity Post(TEntity entity, Query<TEntity> query) { throw new NotImplementedException(); }

		public IDownloadableEntity PostFile(string uri, string filePath) { throw new NotImplementedException(); }

		public TEntity Put(string uri, TEntity entity) { return Put(uri, entity, new Query<TEntity>()); }
		public TEntity Put(string uri, TEntity entity, Query<TEntity> query) { throw new NotImplementedException(); }
	}
}
