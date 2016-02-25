using RDD.Domain;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Domain
{
	public interface IApiService<TEntity>
		where TEntity : class, IEntityBase
	{
		IEnumerable<TEntity> Get(Query<TEntity> query);
		IEnumerable<TEntity> GetAll();
		TEntity GetById(string uri);
		TEntity Post(string uri, NameValueCollection data);
		TEntity Post(string uri, TEntity entity);
		IDownloadableEntity PostFile(string uri, string filePath);
		TEntity Put(string uri, TEntity entity);
	}
}
