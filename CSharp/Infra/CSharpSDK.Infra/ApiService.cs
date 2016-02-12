using Newtonsoft.Json;
using RDD.Domain;
using RDD.Domain.Contexts;
using RDD.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Cache;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra
{
	public abstract class ApiService<TEntity>
	{
		protected ApiSettings Settings { get; set; }
		protected Uri BaseUri { get; set; }

		public ApiService(ApiSettings settings)
		{
			Settings = settings;
		}

		public IEnumerable<TEntity> GetAll()
		{
			using (var wc = new WebClient())
			{
				// Disable cache
				wc.CachePolicy = new RequestCachePolicy(RequestCacheLevel.NoCacheNoStore);
				wc.Headers.Add("Authorization", String.Format("Lucca {0}={1}", Settings.AuthenticationInfo.Type.ToString().ToLower(), Settings.AuthenticationInfo.Token));

				var logger = Resolver.Current().Resolve<ILogService>();

				try
				{
					// Retrieve JSON
					logger.Log(LogLevel.DEBUG, "GET {0}", BaseUri);

					var json = wc.DownloadString(BaseUri);

					logger.Log(LogLevel.DEBUG, "Lucca response = {0}", json);

					// Parse
					switch (Settings.ApiVersion)
					{
						case ApiVersion.v2:
							{
								var response = JsonConvert.DeserializeObject<ApiResponse<TEntity>>(json);

								if (!String.IsNullOrEmpty(response.Message))
								{
									logger.Log(LogLevel.ERROR, "GET {0}; response = {1}", BaseUri, json);

									throw new HttpLikeException((HttpStatusCode)response.Status, response.Message);
								}

								return response.Data;
							}
						case ApiVersion.v3:
							{
								var response = JsonConvert.DeserializeObject<ApiCollectionResponse<TEntity>>(json);

								if (!String.IsNullOrEmpty(response.Message))
								{
									logger.Log(LogLevel.ERROR, "GET {0}; response = {1}", BaseUri, json);

									throw new HttpLikeException((HttpStatusCode)response.Status, response.Message);
								}

								return response.Data.Items;
							}
						default:
							throw new NotImplementedException();
					}
				}
				catch (WebException e)
				{
					// Do NOT throw exception with URL in message as URL contains token
					logger.Log(LogLevel.CRITICAL, "Unable to GET {0}. InnerException = {1}", BaseUri, e.Message);

					throw e;
				}
			}
		}
	}
}
