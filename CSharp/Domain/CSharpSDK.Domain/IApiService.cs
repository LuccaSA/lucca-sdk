using RDD.Domain;
using RDD.Domain.Models.Querying;
using System.Collections.Generic;

namespace Lucca.CSharpSDK.Domain
{
	public interface IApiService<TEntity>
		where TEntity : class, IEntityBase
	{
		IEnumerable<TEntity> Get(Query<TEntity> query);

		IEnumerable<TEntity> GetAll();
		IEnumerable<TEntity> GetAll(Query<TEntity> query);

		TEntity GetById(string uri);
		TEntity GetById(string uri, Query<TEntity> query);

		TEntity Post(TEntity entity);
		TEntity Post(TEntity entity, Query<TEntity> query);

		IDownloadableEntity PostFile(string uri, string filePath);

		TEntity Put(string uri, TEntity entity);
		TEntity Put(string uri, TEntity entity, Query<TEntity> query);
	}
}
