using Lucca.CSharpSDK.Domain;
using Newtonsoft.Json;
using RDD.Domain;
using RDD.Domain.Contexts;
using RDD.Domain.Exceptions;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Cache;
using System.Text;
using System.Threading.Tasks;
using Lucca.CSharpSDK.Infra.Extensions;
using System.Collections.Specialized;
using Lucca.CSharpSDK.Infra.Common;

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
			using (var wc = new WebClient())
			{
				// Disable cache
				wc.CachePolicy = new RequestCachePolicy(RequestCacheLevel.NoCacheNoStore);
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
			return Get(new Query<TEntity>());
		}

		public TEntity GetById(string uri) { throw new NotImplementedException(); }
		public TEntity Post(string uri, NameValueCollection data) { throw new NotImplementedException(); }
		public TEntity Post(string uri, TEntity entity) { throw new NotImplementedException(); }
		public IDownloadableEntity PostFile(string uri, string filePath) { throw new NotImplementedException(); }
		public TEntity Put(string uri, TEntity entity) { throw new NotImplementedException(); }
	}
}
