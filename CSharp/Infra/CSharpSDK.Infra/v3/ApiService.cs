using Lucca.CSharpSDK.Domain;
using Lucca.CSharpSDK.Infra.Common;
using Lucca.CSharpSDK.Infra.Extensions;
using Newtonsoft.Json;
using RDD.Domain;
using RDD.Domain.Contexts;
using RDD.Domain.Exceptions;
using RDD.Domain.Helpers;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Cache;
using System.Text;

namespace Lucca.CSharpSDK.Infra.v3
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
					var response = JsonConvert.DeserializeObject<ApiCollectionResponse<TEntity>>(json);

					if (!String.IsNullOrEmpty(response.Message))
					{
						logger.Log(LogLevel.ERROR, "GET {0}; response = {1}", uri, json);

						throw new HttpLikeException((HttpStatusCode)response.Status, response.Message);
					}

					return response.Data.Items;
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

		public TEntity GetById(string uri)
		{
			return GetById(uri, new Query<TEntity>());
		}

		public TEntity GetById(string uri, Query<TEntity> query)
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

				try
				{
					// Retrieve JSON
					logger.Log(LogLevel.DEBUG, "GET {0}", uri);

					var json = wc.DownloadString(uri);

					logger.Log(LogLevel.DEBUG, "Lucca response = {0}", json);

					// Parse
					var response = JsonConvert.DeserializeObject<ApiEntityResponse<TEntity>>(json);

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

		public TEntity Post(TEntity entity)
		{
			return Post(entity, new Query<TEntity>());
		}

		public TEntity Post(TEntity entity, Query<TEntity> query)
		{
			query.Verb = HttpVerb.POST;
			return PostOrPut(query, _baseUri.ToString(), entity);
		}

		public TEntity Put(string uri, TEntity entity)
		{
			return Put(uri, entity, new Query<TEntity>());
		}

		public TEntity Put(string uri, TEntity entity, Query<TEntity> query)
		{
			query.Verb = HttpVerb.PUT;
			return PostOrPut(query, uri, entity);
		}

		private TEntity PostOrPut(Query<TEntity> query, string fullUrl, TEntity entity)
		{
			// Do no serialize NULL values so deserialiser does NOT try to set them
			// (eg: url property which is read only)
			var json = JsonConvert.SerializeObject(entity, new JsonSerializerSettings
			{
				DefaultValueHandling = DefaultValueHandling.Ignore,
			});

			var bytes = Encoding.ASCII.GetBytes(json);

			return CallAPI(client => client.UploadData(fullUrl, query.Verb.ToString(), bytes), String.Format("{0} {1} with JSON body {2}.", query.Verb.ToString(), fullUrl, json), query);
		}

		private TEntity CallAPI(Func<IWebClient, byte[]> action, string actionDescription, Query<TEntity> query, string contentType = "application/json")
		{
			using (var client = Resolver.Current().Resolve<IWebClientFactory>().Create())
			{
				// Disable cache
				client.CachePolicy = new RequestCachePolicy(RequestCacheLevel.NoCacheNoStore);

				foreach (var key in query.Headers.RawHeaders.AllKeys)
				{
					client.Headers.Add(key, query.Headers.RawHeaders[key]);
				}
				client.Headers.Add("Authorization", String.Format("Lucca {0}={1}", _settings.AuthenticationInfo.Type.ToString().ToLower(), _settings.AuthenticationInfo.Token));

				// Required by Lucca
				// Depending on the WebClient function used (eg: UploadValues), Content-Type cannot be set
				// => The Content-Type header cannot be changed from its default value for this request
				if (!String.IsNullOrEmpty(contentType))
				{
					client.Headers["Content-Type"] = contentType;
				}

				var logger = Resolver.Current().Resolve<ILogService>();

				try
				{
					// Retrieve JSON
					logger.Log(LogLevel.DEBUG, actionDescription);
					var raw = action(client);
					var json = Encoding.ASCII.GetString(raw);
					logger.Log(LogLevel.DEBUG, "Lucca response = {0}", json);

					// Parse
					var response = JsonConvert.DeserializeObject<ApiEntityResponse<TEntity>>(json);

					if (!String.IsNullOrEmpty(response.Message))
					{
						logger.Log(LogLevel.ERROR, "action = {0}; response = {1}", actionDescription, json);

						throw new HttpLikeException(HttpStatusCode.InternalServerError, response.Message);
					}

					return response.Data;
				}
				catch (WebException e)
				{
					// Do NOT throw exception with URL in message as URL contains token
					logger.Log(LogLevel.CRITICAL, "Unable to {0} InnerException = {1}", actionDescription, e.Message);

					throw e;
				}
			}
		}

		public IDownloadableEntity PostFile(string uri, string filePath) { throw new NotImplementedException(); }
	}
}
